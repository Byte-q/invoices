import { cookies } from "next/headers"; // NEW: To read the session cookie
import { verifyToken } from "@/lib/auth"; // NEW: Assuming this utility exists based on route.ts
import {
  CustomerField,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { NextResponse } from "next/server";

// ----------------------------------------------------
// HELPER FUNCTION: Get Business ID from Auth
// ----------------------------------------------------
/**
 * Retrieves the primary Business ID associated with the authenticated user
 * by decoding the 'wb_session' cookie.
 */
async function getBusinessId(): Promise<string | undefined> {
  // 1. Get the session cookie
  const cookie = await cookies();
  const session = cookie.get("wb_session")?.value;

  if (!session) {
    return undefined;
  }

  // 2. Decode the JWT to get the userId
  // NOTE: We assume verifyToken is available and returns { userId: string }
  const decoded = await verifyToken(session);
  const userId = decoded?.userId;

  if (!userId) {
    return undefined;
  }

  // 3. Look up the Business ID associated with the User
  const userWithBusiness = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      organizations: {
        select: {
          businesses: {
            select: { id: true },
            take: 1, // Get the primary business
          },
        },
        take: 1, // Get the primary organization
      },
    },
  });

  return userWithBusiness?.organizations[0]?.businesses[0]?.id;
}

/**
 * Retrieves the primary Business ID associated with the authenticated user
 * by decoding the 'wb_session' cookie.
 */
export async function getUserId(): Promise<string | undefined> {
  // 1. Get the session cookie
  const cookie = await cookies();
  const session = cookie.get("wb_session")?.value;

  if (!session) {
    return undefined;
  }

  // 2. Decode the JWT to get the userId
  // NOTE: We assume verifyToken is available and returns { userId: string }
  const decoded = await verifyToken(session);
  const userId = decoded?.userId;

  if (!userId) {
    return undefined;
  }
  return userId;
}

export async function saveEncryptedTokenToDB(userId: string, token: string) {
  try {
    await prisma.organizations.update({
      where: { ownerId: userId },
      data: { refreshToken: token },
    });
    return new NextResponse("successfully stored refreshToken");
  } catch (err) {
    console.log("Error Failed to stored refreshToken", err);
  }
}

export async function getEncryptedTokenFromDB(userId: string) {
  const org = await prisma.organizations.findUnique({
    where: { ownerId: userId },
  });
  const encryptedToken = org?.refreshToken;
  
  return encryptedToken;
}

export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    // REMOVED: userId parameter
    const businessId = await getBusinessId(); // Now called without argument

    if (!businessId) {
      console.warn(
        `No business found for authenticated user. Returning empty revenue list.`
      );
      return [];
    }

    const revenue = await prisma.revenue.findMany({
      where: { businessId: businessId },
      orderBy: {
        month: "asc", // Sort by month string (assuming format is 3-letter)
      },
    });

    return revenue as Revenue[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices(): Promise<LatestInvoice[]> {
  try {
    // REMOVED: userId parameter
    const businessId = await getBusinessId();

    if (!businessId) {
      console.warn(
        `No business found for authenticated user. Returning empty list.`
      );
      return [];
    }

    const latestInvoicesData = await prisma.invoices.findMany({
      where: {
        businessId: businessId, // Filter by the user's business
      },
      orderBy: {
        // Order by the due date in descending order (latest first)
        createdAt: "desc",
      },
      take: 5, // Equivalent to SQL's LIMIT 5
      include: {
        // Include the related customer data (SQL JOIN)
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
    });

    const latestInvoices: LatestInvoice[] = latestInvoicesData.map(
      (invoice) => ({
        id: invoice.id,
        amount: formatCurrency(invoice.amount),
        name: invoice.customer!.name!,
        email: invoice.customer!.email!,
        image_url: invoice.customer!.image_url!,
      })
    );

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // REMOVED: userId parameter
    const businessId = await getBusinessId();

    const zeroMetrics = {
      numberOfCustomers: 0,
      numberOfInvoices: 0,
      totalPaidInvoices: 0,
      totalPendingInvoices: 0,
    };

    if (!businessId) {
      console.warn(
        `No business found for authenticated user. Returning zero metrics.`
      );
      return zeroMetrics;
    }

    // 2. Initialize multiple Prisma count queries in parallel
    const promiseCustomers = prisma.customers.count({
      where: { businessId: businessId },
    });

    const promiseInvoices = prisma.invoices.count({
      where: { businessId: businessId },
    });

    // Count of 'PAID' invoices
    const promisePaidInvoices = prisma.invoices.count({
      where: { businessId: businessId, status: "PAID" },
    });

    // Count of 'PENDING' invoices
    const promisePendingInvoices = prisma.invoices.count({
      where: { businessId: businessId, status: "PENDING" },
    });

    // 3. Wait for all promises to resolve
    const data = await Promise.all([
      promiseCustomers,
      promiseInvoices,
      promisePaidInvoices,
      promisePendingInvoices,
    ]);

    // 4. Destructure the results
    const [
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    ] = data;

    // 5. Return the metrics
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string, // REMOVED: userId parameter
  currentPage: number
): Promise<InvoicesTable[]> {
  const businessId = await getBusinessId(); // Now called without argument
  if (!businessId) return [];

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  // NOTE: Assuming query search for amount is done on an integer (cents)
  const amountInt = isNaN(parseInt(query)) ? undefined : parseInt(query);

  try {
    const invoices = await prisma.invoices.findMany({
      where: {
        businessId: businessId, // Filter by business
        OR: [
          // Search by customer fields (via relation)
          { customer: { name: { contains: query, mode: "insensitive" } } },
          { customer: { email: { contains: query, mode: "insensitive" } } },
          // Search by invoice fields
          { number: { contains: query, mode: "insensitive" } },
          // { status: { contains: query, mode: 'insensitive' } },
          // Search by amount (only for exact integer match in cents)
          { amount: amountInt },
        ],
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
      orderBy: {
        dueDate: "desc",
      },
      select: {
        id: true,
        amount: true,
        status: true,
        customerId: true,
        dueDate: true, // Keep the Date object here
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
    });

    // Map and format for the final output
    return invoices.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount,
      status: invoice.status as "PENDING" | "PAID",
      dueDate: invoice.dueDate,
      name: invoice.customer!.name!,
      customer_id: invoice.customerId,
      email: invoice.customer!.email!,
      image_url: invoice.customer!.image_url!,
    })) as InvoicesTable[];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  const businessId = await getBusinessId(); // Now called without argument
  if (!businessId) return 0;

  const amountInt = isNaN(parseInt(query)) ? undefined : parseInt(query);

  try {
    const count = await prisma.invoices.count({
      where: {
        businessId: businessId,
        OR: [
          { customer: { name: { contains: query, mode: "insensitive" } } },
          { customer: { email: { contains: query, mode: "insensitive" } } },
          { number: { contains: query, mode: "insensitive" } },
          // { status: { contains: query, mode: 'insensitive' } },
          { amount: amountInt },
        ],
      },
    });

    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  const businessId = await getBusinessId(); // Now called without argument
  if (!businessId) return undefined;

  try {
    const invoice = await prisma.invoices.findUnique({
      where: {
        id: id,
        businessId: businessId,
      },
      select: {
        id: true,
        customerId: true,
        amount: true,
        status: true,
        dueDate: true,
      },
    });

    if (!invoice) {
      return undefined;
    }

    // Convert amount from cents to dollars for the form
    return {
      id: invoice.id,
      customer_id: invoice.customerId,
      amount: invoice.amount / 100,
      status: invoice.status,
      dueDate: invoice.dueDate,
    } as InvoiceForm;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  const businessId = await getBusinessId(); // Now called without argument
  if (!businessId) return [];

  try {
    const customers = await prisma.customers.findMany({
      where: {
        businessId: businessId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return customers as CustomerField[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchCustomersPages(query: string) {
  const businessId = await getBusinessId(); // Now called without argument

  if (!businessId) {
    return 0;
  }

  try {
    // Use prisma.customers.count() - pure ORM, no raw SQL necessary
    const count = await prisma.customers.count({
      where: {
        businessId: businessId, // 1. Multi-tenancy filter
        OR: [
          // 2. Search by name
          {
            name: {
              contains: query,
              mode: "insensitive", // PostgreSQL's ILIKE is handled by 'mode: insensitive'
            },
          },
          // 3. Search by email
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of customers.");
  }
}

export async function fetchFilteredCustomers(
  query: string, // REMOVED: userId parameter
  currentPage: number
) {
  const businessId = await getBusinessId(); // Now called without argument
  if (!businessId) return [];

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // 1. Fetch customers, filtered and paginated, with all related invoices
    const customersWithInvoices = await prisma.customers.findMany({
      where: {
        businessId: businessId, // Multi-tenancy filter
        OR: [
          // Filter customers by name or email
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      // Pagination and Ordering
      skip: offset,
      take: ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
      // Include related invoices to perform aggregation in memory
      include: {
        invoices: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    // 2. Perform aggregation (the equivalent of SQL's GROUP BY and SUM(CASE WHEN...))
    const customers = customersWithInvoices.map((customer) => {
      const total_invoices = customer.invoices.length;
      let total_pending_raw = 0; // In cents/minor units
      let total_paid_raw = 0; // In cents/minor units

      customer.invoices.forEach((invoice) => {
        if (invoice.status === "PENDING") {
          total_pending_raw += invoice.amount;
        } else if (invoice.status === "PAID") {
          total_paid_raw += invoice.amount;
        }
      });

      // 3. Map to the final expected output format (CustomersTableType)
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url!,
        total_invoices: total_invoices, // Raw number

        // Format currency for the final output string, as required by the mapping
        total_pending: formatCurrency(total_pending_raw),
        total_paid: formatCurrency(total_paid_raw),
      };
    });

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}
