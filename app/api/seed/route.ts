import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// The main seeding function, adapted from your original file
async function seedDatabase() {
  console.log("🌱 Starting API seed...");

  try {
    // 🛑 STEP 0: CLEANUP (Delete all records in reverse dependency order) 🛑
    await prisma.$transaction([
      prisma.revenue.deleteMany(),
      prisma.invoices.deleteMany(),
      prisma.customers.deleteMany(),
      prisma.businesses.deleteMany(),
      prisma.organizations.deleteMany(),
      prisma.users.deleteMany(), // Must be last due to organization's ownerId foreign key
    ]);
    console.log("Database cleanup complete.");
    // -----------------------------------------------------------------------

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1️⃣ Create User
    const user = await prisma.users.create({
      data: {
        firstName: "Mohammed",
        lastName: "Altahir",
        email: "mohammed@example.com",
        password: passwordHash,
      },
    });

    // 2️⃣ Create Organization owned by this user
    const organization = await prisma.organizations.create({
      data: {
        name: "Webyra Technologies",
        ownerId: user.id,
      },
    });

    // Create business
    const business = await prisma.businesses.create({
      data: {
        name: "Webyra Invoicing",
        organizationId: organization.id,
      },
    });

    // Create customers
    await prisma.customers.createMany({
      data: [
        {
          name: "Evil Rabbit",
          email: "evil@rabbit.com",
          image_url: "/customers/evil-rabbit.png",
          businessId: business.id,
        },
        {
          name: "Delba de Oliveira",
          email: "delba@oliveira.com",
          image_url: "/customers/delba-de-oliveira.png",
          businessId: business.id,
        },
        {
          name: "Lee Robinson",
          email: "lee@robinson.com",
          image_url: "/customers/lee-robinson.png",
          businessId: business.id,
        },
        {
          name: "Michael Novotny",
          email: "michael@novotny.com",
          image_url: "/customers/michael-novotny.png",
          businessId: business.id,
        },
        {
          name: "Amy Burns",
          email: "amy@burns.com",
          image_url: "/customers/amy-burns.png",
          businessId: business.id,
        },
        {
          name: "Balazs Orban",
          email: "balazs@orban.com",
          image_url: "/customers/balazs-orban.png",
          businessId: business.id,
        },
      ],
    });

    // Fetch customers to link in invoices
    const customerList = await prisma.customers.findMany({
      where: { businessId: business.id },
    });

    // Create invoices
    const invoices = await Promise.all([
      // ... (Rest of the invoice creation logic) ...
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[0].id,
          number: `2025-10-01-${customerList[0].id}`,
          amount: 4500,
          status: "PAID",
          dueDate: new Date("2025-10-10"),
        },
      }),
      // Add the remaining 7 invoice creations here, following the structure above
      // ...
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[1].id,
          number: `2025-10-01-${customerList[1].id}1`,
          amount: 3000,
          status: "PENDING",
          dueDate: new Date("2025-11-01"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[2].id,
          number: `2025-10-01-${customerList[2].id}2`,
          amount: 1200,
          status: "PAID",
          dueDate: new Date("2025-09-25"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[3].id,
          number: `2025-10-01-${customerList[3].id}3`,
          amount: 800,
          status: "PAID",
          dueDate: new Date("2025-08-30"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[0].id,
          number: `2025-10-01-${customerList[0].id}4`,
          amount: 1500,
          status: "PENDING",
          dueDate: new Date("2025-11-20"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[2].id,
          number: `2025-10-01-${customerList[2].id}5`,
          amount: 2700,
          status: "PAID",
          dueDate: new Date("2025-09-20"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[4].id,
          number: `2025-10-01-${customerList[4].id}6`,
          amount: 2700,
          status: "PAID",
          dueDate: new Date("2025-09-20"),
        },
      }),
      prisma.invoices.create({
        data: {
          businessId: business.id,
          customerId: customerList[5].id,
          number: `2025-10-01-${customerList[5].id}7`,
          amount: 2700,
          status: "PAID",
          dueDate: new Date("2025-09-20"),
        },
      }),
    ]);

    // Create revenues
    await prisma.revenue.createMany({
      data: [
        { month: "Jan", revenue: 2000, businessId: business.id },
        { month: "Feb", revenue: 1800, businessId: business.id },
        { month: "Mar", revenue: 2200, businessId: business.id },
        { month: "Apr", revenue: 2500, businessId: business.id },
        { month: "May", revenue: 2300, businessId: business.id },
        { month: "Jun", revenue: 3200, businessId: business.id },
        { month: "Jul", revenue: 3500, businessId: business.id },
        { month: "Aug", revenue: 3700, businessId: business.id },
        { month: "Sep", revenue: 2500, businessId: business.id },
        { month: "Oct", revenue: 2800, businessId: business.id },
        { month: "Nov", revenue: 3000, businessId: business.id },
        { month: "Dec", revenue: 4800, businessId: business.id },
      ],
    });

    console.log("✅ API Seed completed successfully!");

    return {
      user: user.email,
      organization: organization.name,
      business: business.name,
      customers: customerList.length,
      invoices: invoices.length,
      paidRevenues: invoices.filter((i) => i.status === "PAID").length,
    };
  } catch (error) {
    console.error("API Seed Error:", error);
    throw new Error("Failed to seed database.");
  } finally {
    // You may or may not want to disconnect here depending on how you manage the Prisma Client in a Next.js environment.
    // For a simple route, it's generally fine to let Next.js handle the lifecycle, but you can keep it for safety:
    // await prisma.$disconnect();
  }
}

// Handler for POST requests to /api/seed
export async function POST(req: NextRequest) {
  // ⚠️ Security Note: In a real application, you MUST add security checks here.
  // This route should only be accessible in development environments or by
  // authenticated/authorized users (e.g., an admin token/key).
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Seeding is disabled in production." },
      { status: 403 }
    );
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json(
      {
        message: "Database successfully seeded via API.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to seed database.",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
