import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

interface WaitlistEntry {
  id: string;
  firstName: string;
  lastInitial: string;
  email: string;
  category: string;
  instagram: string;
  tiktok: string;
  x: string;
  notes: string;
  joinedAt: string;
}

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const STORAGE_KEY = 'haleera_waitlist';

const clean = (v: unknown, max = 200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

// POST — join the waitlist
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = clean(body.email).toLowerCase();
    const firstName = clean(body.firstName, 80);
    if (!email || !email.includes('@') || !firstName) {
      return NextResponse.json(
        { error: 'A first name and valid email are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const entry: WaitlistEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      firstName,
      lastInitial: clean(body.lastInitial, 1).toUpperCase(),
      email,
      category: clean(body.category, 60),
      instagram: clean(body.instagram, 60).replace(/^@/, ''),
      tiktok: clean(body.tiktok, 60).replace(/^@/, ''),
      x: clean(body.x, 60).replace(/^@/, ''),
      notes: clean(body.notes, 1000),
      joinedAt: new Date().toISOString(),
    };

    const redis = getRedis();
    if (!redis) {
      // No storage configured — still let the visitor through gracefully.
      console.warn('Waitlist storage not configured; entry not persisted:', entry.email);
      return NextResponse.json({ ok: true, stored: false }, { status: 202, headers: corsHeaders });
    }

    const existing = (await redis.get<WaitlistEntry[]>(STORAGE_KEY)) || [];
    if (existing.some((e) => e.email === email)) {
      return NextResponse.json(
        { ok: true, alreadyJoined: true },
        { status: 200, headers: corsHeaders }
      );
    }

    existing.unshift(entry);
    await redis.set(STORAGE_KEY, existing);

    return NextResponse.json(
      { ok: true, position: existing.length },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Failed to save waitlist entry:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500, headers: corsHeaders });
  }
}

// GET — waitlist size only (no PII exposed)
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ count: 0 }, { headers: corsHeaders });
    }
    const existing = (await redis.get<WaitlistEntry[]>(STORAGE_KEY)) || [];
    return NextResponse.json({ count: existing.length }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to read waitlist:', error);
    return NextResponse.json({ count: 0 }, { headers: corsHeaders });
  }
}
