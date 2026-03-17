import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const result = db
    .prepare(`INSERT INTO thoughts (user_id, text, created_at) VALUES (?, ?, ?)`)
    .run(session.userId, text.trim(), new Date().toISOString());

  const thought = db
    .prepare(`SELECT * FROM thoughts WHERE id = ?`)
    .get(result.lastInsertRowid) as { id: number; user_id: number; text: string; created_at: string };

  return NextResponse.json({ thought });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const thoughts = db
    .prepare(
      `SELECT * FROM thoughts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(session.userId, limit, offset) as Array<{
    id: number;
    user_id: number;
    text: string;
    created_at: string;
  }>;

  const total = (
    db
      .prepare(`SELECT COUNT(*) as count FROM thoughts WHERE user_id = ?`)
      .get(session.userId) as { count: number }
  ).count;

  return NextResponse.json({ thoughts, total, page, limit });
}
