"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// const UpdateCustomer = CustomerSchema.omit({ id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevSatae: State, formData: FormData) {
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
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function createCustomer(prevSatae: State, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    id: "d6e15727-9fe1-5555-8c5b-ea44a9bd81aa",
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Customer.",
    };
  }

  const { id, name, email } = validatedFields.data;
  // const date = new Date().toISOString().split("T")[0];
  const image_url = "/customers/evil-rabbit.png";

  try {
    await sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${id}, ${name}, ${email}, ${image_url})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: "Database Error: Failed to Create Customer.",
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
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
export async function updateCustomer(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Customer.",
    };
  }

  const { name, email, image_url } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE customers
        SET name = ${name}, email = ${email}, image_url = ${image_url}
        WHERE id = ${id}
      `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  // throw new Error("Failed to Delete Invoice");

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}

export async function deleteCustomer(id: string) {
  // throw new Error("Failed to Delete Invoice");

  await sql`DELETE FROM customers WHERE id = ${id}`;
  revalidatePath("/dashboard/customers");
}

/////////////////////////////////////////////

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
  image_url: z.string(),
});
const CreateUser = UserSchema.omit({
  name: true,
  email: true,
  password: true,
  image_url: true,
});

export async function createUser(prevSatae: State, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    image_url: formData.get("image"),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create User.",
    };
  }

  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const image_url = formData.get('image');
  console.log("data", { name, email, password, image_url });
  // const HashPsd = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: { name, email, password, image: image_url },
    });
  } catch (err) {
    console.log(err);
    return {
      message: "Database Error: Failed to Create User.",
    };
  }

  redirect("/dashboard");
}
