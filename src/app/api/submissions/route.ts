import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

interface HomeValueSubmission {
  id: string;
  address: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'converted';
  notes: string;
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const STORAGE_KEY = 'nk_submissions';

// GET — fetch all submissions
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }
    const data = await redis.get<HomeValueSubmission[]>(STORAGE_KEY);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST — create a new submission (called from homeowner's /value page)
export async function POST(req: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const body = await req.json();
    const submission: HomeValueSubmission = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      address: body.address || '',
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      submittedAt: new Date().toISOString(),
      status: 'new',
      notes: '',
    };

    const existing = (await redis.get<HomeValueSubmission[]>(STORAGE_KEY)) || [];
    existing.unshift(submission);
    await redis.set(STORAGE_KEY, existing);

    return NextResponse.json(submission, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Failed to save submission:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500, headers: corsHeaders });
  }
}

// PATCH — update a submission's status or notes (called from dashboard)
export async function PATCH(req: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const existing = (await redis.get<HomeValueSubmission[]>(STORAGE_KEY)) || [];
    const idx = existing.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    existing[idx] = { ...existing[idx], ...updates };
    await redis.set(STORAGE_KEY, existing);

    return NextResponse.json(existing[idx]);
  } catch (error) {
    console.error('Failed to update submission:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE — remove a submission by id (called from dashboard)
export async function DELETE(req: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const existing = (await redis.get<HomeValueSubmission[]>(STORAGE_KEY)) || [];
    const filtered = existing.filter((s) => s.id !== id);
    await redis.set(STORAGE_KEY, filtered);

    return NextResponse.json({ deleted: id });
  } catch (error) {
    console.error('Failed to delete submission:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
