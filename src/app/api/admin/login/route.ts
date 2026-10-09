import { NextRequest, NextResponse } from 'next/server';

const SUPER_ADMIN_EMAIL = 'hayarifur@gmail.com';
const SUPER_ADMIN_PASS = '704302Ab';
const SESSION_TOKEN = 'playflix_admin_session_auth_secret_token_2026';

// In-memory rate limiting and brute force protection
let failedAttempts = 0;
let lockedUntilTimestamp = 0;

export async function POST(req: NextRequest) {
  try {
    const now = Date.now();

    // Check if lockout is currently active
    if (now < lockedUntilTimestamp) {
      const remainingMinutes = Math.ceil((lockedUntilTimestamp - now) / (60 * 1000));
      return NextResponse.json(
        {
          error: `Security lockout active: 5 failed attempts exceeded. Portal is locked for ${remainingMinutes} more minute(s).`,
          locked: true,
          lockedUntil: lockedUntilTimestamp,
        },
        { status: 429 }
      );
    }

    // If lockout expired, reset counter
    if (lockedUntilTimestamp > 0 && now >= lockedUntilTimestamp) {
      failedAttempts = 0;
      lockedUntilTimestamp = 0;
    }

    const { email, password } = await req.json();

    // Accept either correct email + password, or just correct password with default email
    const isEmailValid = !email || email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const isPassValid = password === SUPER_ADMIN_PASS;

    if (isEmailValid && isPassValid) {
      // Reset rate limit on success
      failedAttempts = 0;
      lockedUntilTimestamp = 0;

      const response = NextResponse.json({ success: true, message: 'Super Admin Login Successful' });
      
      // Set secure HTTP-only cookie
      response.cookies.set('pf_admin_auth', SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // Wrong credentials: increment failed counter
    failedAttempts += 1;

    if (failedAttempts >= 5) {
      lockedUntilTimestamp = Date.now() + 30 * 60 * 1000; // 30 minutes lockout
      return NextResponse.json(
        {
          error: 'Security Alert: 5 failed attempts reached! Admin portal is now locked for 30 minutes.',
          locked: true,
          lockedUntil: lockedUntilTimestamp,
        },
        { status: 429 }
      );
    }

    const remaining = 5 - failedAttempts;
    return NextResponse.json(
      {
        error: `Incorrect password! (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before 30-minute security lockout)`,
        remainingAttempts: remaining,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('pf_admin_auth');
  if (cookie?.value === SESSION_TOKEN) {
    return NextResponse.json({ authenticated: true, email: SUPER_ADMIN_EMAIL });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('pf_admin_auth');
  return response;
}
