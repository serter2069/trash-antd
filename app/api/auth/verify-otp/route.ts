import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const record = db
    .prepare(
      `SELECT * FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(email, code) as { id: number } | undefined;

  if (!record) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  // Clean up used code
  db.prepare(`DELETE FROM otp_codes WHERE id = ?`).run(record.id);

  const user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email) as
    | { id: number }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await createSession(user.id, email);

  return NextResponse.json({ ok: true });
}
