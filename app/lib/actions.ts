"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
  CreateCustomer,
  CreateInvoice,
  State,
  UpdateCustomer,
  UpdateInvoice,
} from "./schemas";

// =========================================================================
// 🔒 AUTHENTICATION HELPER
// =========================================================================

/**
 * Retrieves the authenticated user's business ID from the session cookie.
 * If authentication fails or no business is found, it handles the error.
 */
export async function getBusinessIdFromAuth(): Promise<string> {
  const cookie = await cookies();
  const session = cookie.get("wb_session")?.value;

  if (!session) {
    // Redirect to signin if no session exists
    redirect("/signin");
  }

  // 1. Decode the JWT to get the userId
  // NOTE: This assumes 'verifyToken' is a working async function.
  const decoded = await verifyToken(session);
  const userId = decoded?.userId;

  if (!userId) {
    redirect("/signin");
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
    throw new Error(
      "Authentication Error: User has no associated business to perform actions."
    );
  }

  return businessId;
}

// Invoices

// The Server Action function signature must accept FormData
export async function createInvoice(
  prevState: State,
  formData: FormData
): Promise<State> {
  // Extract and validate fields
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status, dueDate, type } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    // 🔑 Direct server call: Use getBusinessId from your data.ts file
    const businessId = await getBusinessIdFromAuth();

    if (!businessId) {
      return { message: "Authentication Error. Business not found." };
    }

    // --- Invoice Number Logic (Best Practice) ---
    const currentYear = new Date().getFullYear().toString();
    const lastInvoice = await prisma.invoices.findFirst({
      where: {
        businessId: businessId,
        number: { startsWith: `INV-${currentYear}` },
      },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const lastNumber = lastInvoice?.number
      ? parseInt(lastInvoice.number.split("-").pop()!, 10)
      : 0;
    const sequentialPart = (lastNumber + 1).toString().padStart(6, "0");
    const finalInvoiceNumber = `INV-${currentYear}-${sequentialPart}`;
    // ---------------------------------------------

    // 🔑 Direct server call: Prisma operation
    await prisma.invoices.create({
      data: {
        number: finalInvoiceNumber, // Use the unique number
        customerId,
        amount: amountInCents,
        status: status, // Status is now correct (PENDING/PAID/OVERDUE)
        dueDate: dueDate,
        invType: type,
        businessId,
      },
    });

    // Invalidate the cache for the invoices list
    revalidatePath("/dashboard/invoices");

    // Success response
    return { message: "Invoice created successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Create Invoice." };
  }
}

// Update
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = UpdateInvoice.safeParse({
    id: formData.get("id"), // Ensure ID is retrieved from the form data
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { amount, customerId, status, dueDate } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    const businessId = await getBusinessIdFromAuth();

    if (!businessId) {
      return { message: "Authentication Error. Business not found." };
    }

    // 🔑 Use updateMany to ensure multi-tenancy check
    const result = await prisma.invoices.update({
      where: {
        id: id,
        businessId: businessId, // Only update if it belongs to the current business
      },
      data: {
        customerId,
        amount: amountInCents,
        status: status,
        dueDate: dueDate,
      },
    });

    if (!result) {
      return { message: "Invoice not found or unauthorized to update." };
    }

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${id}/edit`); // Revalidate the edit page

    return { message: "Invoice updated successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Update Invoice." };
  }
}

// Delete
export async function deleteInvoice(id: string) {
  try {
    const businessId = await getBusinessIdFromAuth();

    if (!businessId) {
      // Return an error without throwing, to handle gracefully on the client
      return { message: "Authentication Error. Business not found." };
    }

    // 🔑 Use deleteMany for secure multi-tenancy deletion (does not throw P2025 if record is not found)
    const result = await prisma.invoices.delete({
      where: {
        id: id,
        businessId: businessId, // Only delete if it belongs to the current business
      },
    });

    if (!result) {
      return { message: "Invoice not found or unauthorized to delete." };
    }

    revalidatePath("/dashboard/invoices");

    return { message: "Invoice deleted successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Delete Invoice." };
  }
}

// ------------------------------------------------------------------
// 🔑 NEW SERVER ACTION: CREATE CUSTOMER
// ------------------------------------------------------------------

export async function createCustomer(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    // phone: formData.get("phone"),
    // image_url: formData.get("image_url"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or Invalid Customer Fields.",
    };
  }

  const { name, email, phone, image_url } = validatedFields.data;
  const image = "/customers/evil-rabbit.png";
  try {
    const businessId = await getBusinessIdFromAuth();
    if (!businessId) {
      return { message: "Authentication Error. Business not found." };
    }

    await prisma.customers.create({
      data: {
        name,
        email,
        phone,
        image_url: image,
        businessId, // Multi-tenancy security
      },
    });

    revalidatePath("/dashboard/customers/create");
    revalidatePath("/dashboard/customers");
    
    return { message: "Customer created successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    // Handle specific error like unique email violation if needed
    return { message: "Database Error: Failed to Create Customer." };
  }
}

// ------------------------------------------------------------------
// 🔑 NEW SERVER ACTION: UPDATE CUSTOMER
// ------------------------------------------------------------------

export async function updateCustomer(
  id: string,
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = UpdateCustomer.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    image_url: formData.get("image_url"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing or Invalid Customer Fields.",
    };
  }

  const { name, email, phone, image_url } = validatedFields.data;

  try {
    const businessId = await getBusinessIdFromAuth();

    const result = await prisma.customers.updateMany({
      where: {
        id: id,
        businessId: businessId, // Multi-tenancy security
      },
      data: {
        name,
        email,
        phone,
        image_url,
      },
    });

    if (result.count === 0) {
      return { message: "Customer not found or unauthorized to update." };
    }

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}/edit`);

    return { message: "Customer updated successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to Update Customer." };
  }
}

// ------------------------------------------------------------------
// 🔑 NEW SERVER ACTION: DELETE CUSTOMER
// ------------------------------------------------------------------

export async function deleteCustomer(id: string) {
  try {
    const businessId = await getBusinessIdFromAuth();

    if (!businessId) {
      return { message: "Authentication Error. Business not found." };
    }

    // ⚠️ IMPORTANT: We use deleteMany to prevent P2025 error.
    // Prisma will also handle CASCADE DELETE on invoices if defined in schema,
    // otherwise this will fail if the customer has existing invoices.
    const result = await prisma.customers.deleteMany({
      where: {
        id: id,
        businessId: businessId, // Multi-tenancy security
      },
    });

    if (result.count === 0) {
      return { message: "Customer not found or unauthorized to delete." };
    }

    revalidatePath("/dashboard/customers");
    return { message: "Customer deleted successfully." };
  } catch (error) {
    console.error("Database Error:", error);
    // If the customer has invoices and you haven't set CASCADE on your foreign key,
    // this will throw an error, which you should handle gracefully.
    return {
      message:
        "Database Error: Failed to Delete Customer. Check for associated invoices.",
    };
  }
}
