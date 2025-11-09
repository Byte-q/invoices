// app/api/signin/user/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Optional: check existing user
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Please signup first" },
        { status: 409 }
      );
    }

    const Matchedhashed = await bcrypt.compare(password, user.password!);
    if (!Matchedhashed) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 409 }
      );
    }

    // Issue JWT cookie
    const token = signToken({ userId: user.id });

    const cookieExpires = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toUTCString();

    const res = NextResponse.json(user);
    
    const sessionCookie = `wb_session=${token}; HttpOnly; Path=/; Expires=${cookieExpires}; SameSite=Lax${
      process.env.NODE_ENV === "production"
        ? `; Secure; Domain=${process.env.COOKIE_DOMAIN}`
        : ""
    }`;

    res.headers.append("Set-Cookie", sessionCookie);

    return res;
  } catch (err) {
    console.error("Login user error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
