// app/api/signup/business/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/wb_session=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, industry } = body;

    const ownerId = await getUserIdFromCookie(req);
    if (!ownerId)
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );

    if (!name || !ownerId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const org = await prisma.organizations.findFirst({
      where: { ownerId: ownerId },
    });
    if (!org) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    const business = await prisma.businesses.create({
      data: {
        name,
        // industry: industry || '',
        organization: { connect: { id: org.id } },
      },
      select: { id: true, name: true },
    });

    return NextResponse.json(business);
  } catch (err) {
    console.error("Create business error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
