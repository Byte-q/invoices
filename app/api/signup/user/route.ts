// app/api/signup/user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Optional: check existing user
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        email,
        password: hashed,
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Issue JWT cookie
    const token = signToken({ userId: user.id });

    const cookieExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

    const res = NextResponse.json(user);
    // Set cookie — adjust domain/path/secure as you need
    res.headers.set(
      'Set-Cookie',
      `wb_session=${token}; HttpOnly; Path=/; Expires=${cookieExpires}; SameSite=Lax${process.env.NODE_ENV === 'production' ? `; Secure; Domain=${process.env.COOKIE_DOMAIN}` : ''}`
    );

    return res;
  } catch (err) {
    console.error('Create user error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
