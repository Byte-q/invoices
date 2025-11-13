// actions.ts

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
// NOTE: Assuming you have a utility function 'verifyToken' in '@/lib/auth'
// which decodes the JWT and returns the payload (e.g., { userId: string }).
import { verifyToken } from "@/lib/auth"; 


// =========================================================================
// 🔒 AUTHENTICATION HELPER
// =========================================================================

/**
 * Retrieves the authenticated user's business ID from the session cookie.
 * If authentication fails or no business is found, it handles the error.
 */
export async function getBusinessIdFromAuth(): Promise<string> {
  const cookie = await cookies();
  const session = cookie.get('wb_session')?.value;
  
  if (!session) {
    // Redirect to signin if no session exists
    redirect('/signin');
  }

  // 1. Decode the JWT to get the userId
  // NOTE: This assumes 'verifyToken' is a working async function.
  const decoded = await verifyToken(session); 
  const userId = decoded?.userId;
  
  if (!userId) {
    redirect('/signin');
  }

  // 2. Look up the Business ID associated with the User (based on data.ts logic)
  const userWithBusiness = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        select: {
          businesses: {
            select: { id: true },
            take: 1, 
          },
        },
        take: 1, 
      },
    },
  });

  const businessId = userWithBusiness?.organizations[0]?.businesses[0]?.id;

  if (!businessId) {
    // If the user is authenticated but has no business record, throw an error
    throw new Error('Authentication Error: User has no associated business to perform actions.');
  }

  return businessId;
}


// =========================================================================
// 📝 ZOD SCHEMAS
// =========================================================================

const CustomerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty."),
  email: z.string().email("Invalid email address."),
});

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
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateCustomer = CustomerSchema;
const UpdateCustomer = CustomerSchema; 

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};


// =========================================================================
// ⚙️ SERVER ACTIONS
// =========================================================================

export async function createInvoice(prevSatae: State, formData: FormData, date: Date) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  
  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();

    await prisma.invoices.create({
      data: {
        number: `${date}-${businessId}`,
        customerId: customerId,
        amount: amountInCents,
        status: status.toUpperCase() as 'PENDING' | 'PAID',
        dueDate: date,
        // 🔒 SECURITY: Scope the new invoice to the user's business
        businessId: businessId, 
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Invoice. Check business scope.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function createCustomer(prevSatae: State, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  const { name, email } = validatedFields.data;
  const image_url = "/customers/evil-rabbit.png"; 

  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();

    await prisma.customers.create({
      data: {
        name: name,
        email: email,
        image_url: image_url,
        // 🔒 SECURITY: Scope the new customer to the user's business
        businessId: businessId, 
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Customer. Check business scope.",
    };
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();

    // 🔒 SECURITY: Add businessId to the WHERE clause to ensure only the user's invoices can be updated
    await prisma.invoices.update({
      where: { id: id, businessId: businessId },
      data: {
        customerId: customerId,
        amount: amountInCents,
        status: status.toUpperCase() as 'PENDING' | 'PAID',
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Database Error: Failed to Update Invoice. Check ID and business scope." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateCustomer(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Customer.",
    };
  }
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const image_url = formData.get("image_url") as string || undefined;

  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();

    // 🔒 SECURITY: Use updateMany with businessId in the WHERE clause
    // updateMany is used because updateMany supports a composite WHERE clause,
    // while update only works on unique constraints (like id).
    await prisma.customers.updateMany({
      where: { id: id, businessId: businessId },
      data: {
        name: name,
        email: email,
        ...(image_url && { image_url: image_url }),
      },
    });
  } catch (error) {
    console.error(error);
    return { message: "Database Error: Failed to Update Customer. Check ID and business scope." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();
    
    // 🔒 SECURITY: Add businessId to the WHERE clause to ensure only the user's data is deleted
    await prisma.invoices.deleteMany({
      where: { id: id, businessId: businessId },
    });
    revalidatePath("/dashboard/invoices");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to Delete Invoice. Check business scope.");
  }
}

export async function deleteCustomer(id: string) {
  try {
    // 🔒 SECURITY: Get the authenticated user's business ID
    const businessId = await getBusinessIdFromAuth();

    // 🔒 SECURITY: Add businessId to the WHERE clause to ensure only the user's data is deleted
    await prisma.customers.deleteMany({
      where: { id: id, businessId: businessId },
    });
    revalidatePath("/dashboard/customers");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to Delete Customer. Check business scope.");
  }
}