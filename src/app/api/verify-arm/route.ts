import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { PropertyVerification, MortgageInfo } from '@/lib/types';

const REALESTATE_API_URL = 'https://api.realestateapi.com/v2/PropertyDetail';
const CACHE_KEY = 'nk_verifications';

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Normalize address for consistent cache keys
function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, ' ');
}

// GET — load all cached verifications at once
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({});
    }

    // Get the entire hash of cached verifications
    const data = await redis.hgetall<Record<string, PropertyVerification>>(CACHE_KEY);
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Failed to load cached verifications:', error);
    return NextResponse.json({});
  }
}

// POST — verify a single address (checks cache first)
export async function POST(req: Request) {
  try {
    const apiKey = process.env.REALESTATE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'RealEstateAPI key not configured' },
        { status: 503 }
      );
    }

    const { address } = await req.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const normalizedAddr = normalizeAddress(address);
    const redis = getRedis();

    // 1. Check Redis cache first — never pay for the same address twice
    if (redis) {
      try {
        const cached = await redis.hget<PropertyVerification>(CACHE_KEY, normalizedAddr);
        if (cached) {
          console.log(`Cache HIT for: ${address}`);
          return NextResponse.json({ ...cached, fromCache: true });
        }
        console.log(`Cache MISS for: ${address}`);
      } catch (cacheErr) {
        console.error('Redis cache read error (continuing to API):', cacheErr);
      }
    }

    // 2. Not in cache — call RealEstateAPI
    const response = await fetch(REALESTATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RealEstateAPI error:', response.status, errorText);
      return NextResponse.json(
        { error: `API returned ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const data = result.data;

    if (!data) {
      return NextResponse.json(
        { error: 'No property data found for this address' },
        { status: 404 }
      );
    }

    // Map current mortgages to our type
    const currentMortgages: MortgageInfo[] = (data.currentMortgages || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => ({
        amount: Number(m.amount) || 0,
        interestRate: m.interestRate ?? null,
        interestRateType: m.interestRateType || 'Unknown',
        lenderName: m.lenderName || 'Unknown',
        lenderType: m.lenderType || 'Unknown',
        loanType: m.loanType || 'Unknown',
        loanTypeCode: m.loanTypeCode || '',
        term: m.term || '',
        maturityDate: m.maturityDate || null,
        documentDate: m.documentDate || null,
        position: m.position || 'Unknown',
      })
    );

    // Build owner name from ownerInfo
    const ownerInfo = data.ownerInfo || {};
    const ownerName =
      ownerInfo.owner1FullName ||
      (ownerInfo.companyName ? ownerInfo.companyName : null);

    const verification: PropertyVerification = {
      adjustableRate: data.adjustableRate === true,
      estimatedValue: Number(data.estimatedValue) || 0,
      estimatedEquity: Number(data.estimatedEquity) || 0,
      equityPercent: Number(data.equityPercent) || 0,
      estimatedMortgageBalance: Number(data.estimatedMortgageBalance) || 0,
      openMortgageBalance: Number(data.openMortgageBalance) || 0,
      currentMortgages,
      ownerName,
      yearBuilt: data.propertyInfo?.yearBuilt || null,
      propertyUse: data.propertyInfo?.propertyUse || null,
      lastSaleDate: data.lastSaleDate || null,
      lastSalePrice: Number(data.lastSalePrice) || null,
      fetchedAt: new Date().toISOString(),
    };

    // 3. Store in Redis hash — never look up this address again
    if (redis) {
      try {
        await redis.hset(CACHE_KEY, { [normalizedAddr]: verification });
        console.log(`Cached verification for: ${address}`);
      } catch (cacheErr) {
        console.error('Redis cache write error (result still returned):', cacheErr);
      }
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Verify ARM error:', error);
    return NextResponse.json(
      { error: 'Failed to verify property' },
      { status: 500 }
    );
  }
}
