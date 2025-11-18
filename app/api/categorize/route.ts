import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessIdFromAuth } from "@/app/lib/actions";

export async function GET() {
  try {
    const businessId = await getBusinessIdFromAuth();
    // 2. Find all PENDING invoices whose dueDate is strictly before today
    const updateResult = await prisma.invoices.updateMany({
      where: { businessId, invType: "SENT" },
      data: {
        // 3. Update the type field (you will need to add 'SENDED' to your InvoiceStatus enum)
        invType: "SENT",
      },
    });

    console.log(`Cron Job: Updated ${updateResult.count} invoices to SENDED.`);

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.count} invoices to SENDED.`,
    });
  } catch (error) {
    console.error("Error in overdue cron job:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
