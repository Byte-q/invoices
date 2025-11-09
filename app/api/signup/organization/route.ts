// app/api/signup/organization/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/wb_session=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    const ownerId = await getUserIdFromCookie(req);
    if (!ownerId) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });


    if (!name || !ownerId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Optionally validate owner exists
    const owner = await prisma.users.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return NextResponse.json({ message: 'Owner not found' }, { status: 404 });
    }

    const organization = await prisma.organizations.create({
      data: {
        name,
        // description: description || '',
        owner: { connect: { id: ownerId } },
      },
      select: { id: true, name: true },
    });

    return NextResponse.json(organization);
  } catch (err) {
    console.error('Create org error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
