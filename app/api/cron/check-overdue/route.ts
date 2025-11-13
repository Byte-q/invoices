// app/api/cron/check-overdue/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // 1. Get today's date, set the time to midnight (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // 2. Find all PENDING invoices whose dueDate is strictly before today
    const updateResult = await prisma.invoices.updateMany({
      where: {
        status: 'PENDING', // Only target invoices that are still PENDING
        dueDate: {
          lt: today, // less than today (i.e., yesterday or earlier)
        },
      },
      data: {
        // 3. Update the status field (you will need to add 'OVERDUE' to your InvoiceStatus enum)
        status: 'OVERDUE', 
      },
    });

    console.log(`Cron Job: Updated ${updateResult.count} invoices to OVERDUE.`);

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updateResult.count} invoices to OVERDUE.` 
    });
  } catch (error) {
    console.error('Error in overdue cron job:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}