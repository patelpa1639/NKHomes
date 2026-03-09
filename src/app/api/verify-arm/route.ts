import { NextResponse } from 'next/server';
import { PropertyVerification, MortgageInfo } from '@/lib/types';

const REALESTATE_API_URL = 'https://api.realestateapi.com/v2/PropertyDetail';

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

    return NextResponse.json(verification);
  } catch (error) {
    console.error('Verify ARM error:', error);
    return NextResponse.json(
      { error: 'Failed to verify property' },
      { status: 500 }
    );
  }
}
