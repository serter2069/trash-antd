import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Upsert user
  db.prepare(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`).run(
    email,
    new Date().toISOString()
  );

  // Save OTP
  const code = '1234';
  db.prepare(`INSERT INTO otp_codes (email, code, created_at) VALUES (?, ?, ?)`).run(
    email,
    code,
    new Date().toISOString()
  );

  console.log(`OTP for ${email}: ${code}`);

  return NextResponse.json({ ok: true });
}
