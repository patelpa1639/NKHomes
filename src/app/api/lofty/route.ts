import { NextResponse } from 'next/server';

const LOFTY_API = 'https://api.lofty.com/v1.0/leads';
const LOFTY_KEY = process.env.LOFTY_API_KEY || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  if (!LOFTY_KEY) {
    return NextResponse.json({ error: 'Lofty API key not configured' }, { status: 503, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const names = (body.name || '').split(' ');
    const loftyPayload = {
      firstName: body.firstName || names[0] || '',
      lastName: body.lastName || names.slice(1).join(' ') || '',
      emails: [body.email].filter(Boolean),
      phones: [(body.phone || '').replace(/\D/g, '')].filter(Boolean),
      source: 'Custom Website',
      tags: ['Custom Website', body.formType || 'general'],
    };

    const res = await fetch(LOFTY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${LOFTY_KEY}`,
      },
      body: JSON.stringify(loftyPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Lofty API error', details: err }, { status: res.status, headers: corsHeaders });
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, leadId: data.leadId }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Lofty proxy error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500, headers: corsHeaders });
  }
}
