import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// import { CreateInvoice } from "@/app/lib/actions"
import { getBusinessIdFromAuth } from "@/app/lib/actions"
import { revalidatePath } from "next/cache"
import z from "zod"

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, {
    message: "Please select a customer.", 
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    message: "Please select an invoice status.", // Correct Zod message pattern
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    })

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          errors: validatedFields.error.flatten().fieldErrors,
          message: "Missing Fields. Failed to Create Invoice.",
        },
        { status: 400 }
      )
    }

    const { customerId, amount, status } = validatedFields.data
    const amountInCents = amount * 100
    console.log("data", { customerId, amount, status })
    const businessId = await getBusinessIdFromAuth()

    await prisma.invoices.create({
      data: {
        number: `${Date.now()}-${businessId}`,
        customerId,
        amount: amountInCents,
        status: status.toUpperCase() as "PENDING" | "PAID",
        dueDate: new Date(),
        businessId,
      },
    })

    revalidatePath("/dashboard/invoices")

    return NextResponse.json(
      { message: "Invoice created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json(
      {
        message:
          "Database Error: Failed to Create Invoice. Check business scope.",
      },
      { status: 500 }
    )
  }
}
