import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessIdFromAuth } from "@/app/lib/actions";
import { revalidatePath } from "next/cache";
import z from "zod";

const FormSchema = z.object({
  id: z.string(),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["PENDING", "PAID"], {
    message: "Please select an invoice status.", // Correct Zod message pattern
  }),
  dueDate: z.coerce.date(),
});

const CreateInvoice = FormSchema.omit({ });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const validatedFields = CreateInvoice.safeParse({
      id: formData.get("id"),
      dueDate: formData.get("dueDate"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });
    console.log("check1", validatedFields);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          errors: validatedFields.error.flatten().fieldErrors,
          message: "Missing Fields. Failed to Create Invoice.",
        },
        { status: 400 }
      );
    }

    const { id, amount, status, dueDate } = validatedFields.data;
    const amountInCents = amount * 100;

    const businessId = await getBusinessIdFromAuth();
    console.log("check", businessId);

    await prisma.invoices.update({
      where: { id, businessId },
      data: {
        amount: amountInCents,
        status: status.toUpperCase() as "PENDING" | "PAID",
        dueDate: dueDate,
      },
    });

    revalidatePath("/dashboard/invoices");

    return NextResponse.json(
      { message: "Invoice created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      {
        message:
          "Database Error: Failed to Create Invoice. Check business scope.",
      },
      { status: 500 }
    );
  }
}
