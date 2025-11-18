// app/api/signin/user/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessIdFromAuth } from "@/app/lib/actions";

export async function GET(req: Request) {
  try {

    const businessId = await getBusinessIdFromAuth();

    const invoices = await prisma.invoices.findMany({ where: { businessId } });
 
    return NextResponse.json(invoices);
  } catch (err) {
    console.error("Login user error", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
