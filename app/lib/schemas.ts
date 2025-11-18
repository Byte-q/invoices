// app/lib/schemas.ts (NO "use server" directive here)

import z from "zod";

// --- Invoice Schemas ---

export type State = {
  // All error fields are optional and can be an array of strings
  errors?: {
    // Invoice Fields
    customerId?: string[];
    amount?: string[];
    status?: string[];
    dueDate?: string[];
    invType?: string[];
    // Customer Fields
    name?: string[];
    email?: string[];
    phone?: string[];
    image_url?: string[];
    
    // Catch-all for other Zod errors if your schema expands
    [key: string]: string[] | undefined; 
  };
  // Message is always required in the return object
  message: string | null; 
};

const InvoiceFormSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().min(1, { message: "Please select a customer." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["PENDING", "PAID"], {
    message: "Please select an invoice status.",
  }),
  dueDate: z.coerce.date(),
  type: z.enum(["SENT", "RECEIVED"])
});

export const CreateInvoice = InvoiceFormSchema.omit({ id: true });
export const UpdateInvoice = InvoiceFormSchema.required({ id: true }); 

// --- Customer Schemas ---

const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email format." }),
  phone: z.string().optional(),
  image_url: z.string().optional(),
});

export const CreateCustomer = CustomerSchema.omit({ id: true });
export const UpdateCustomer = CustomerSchema.required({ id: true });