import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

interface StoredLead {
  address: string;
  sale_price: number;
  sale_date: string;
  beds: number;
  baths: number;
  sqft: number;
  property_type: string;
  neighborhood: string;
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const STORAGE_KEY = 'nk_leads';

// GET — fetch all saved leads
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(null, { status: 200 });
    }
    const data = await redis.get<StoredLead[]>(STORAGE_KEY);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return NextResponse.json(null, { status: 200 });
  }
}

// POST — save leads (replaces all)
export async function POST(req: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const leads: StoredLead[] = await req.json();
    await redis.set(STORAGE_KEY, leads);

    return NextResponse.json({ saved: leads.length }, { status: 200 });
  } catch (error) {
    console.error('Failed to save leads:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

// DELETE — clear all saved leads (revert to sample data)
export async function DELETE() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    await redis.del(STORAGE_KEY);
    return NextResponse.json({ cleared: true });
  } catch (error) {
    console.error('Failed to clear leads:', error);
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
  }
}
