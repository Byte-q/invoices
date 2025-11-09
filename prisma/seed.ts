import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1️⃣ Create User
  const user = await prisma.users.create({
    data: {
      firstName: "Mohammed",
      lastName: "Altahir",
      email: "mohammed@example.com",
      password: passwordHash,
      // emailVerified: new Date(),
    },
  });

  // 2️⃣ Create Organization owned by this user
  const organization = await prisma.organizations.create({
    data: {
      name: "Webyra Technologies",
      // description: "Modern SaaS company based in Omdurman",
      ownerId: user.id,
      // website: "https://webyra.com",
      // logo: "https://uploadthing.com/example-logo.png",
    },
  });

  // Create business
  const business = await prisma.businesses.create({
    data: {
      name: "Webyra Invoicing",
      // description: "Smart invoicing and accounting platform for SMEs.",
      organizationId: organization.id,
      // address: "Omdurman, Sudan",
      // phone: "+249900000000",
      // email: "info@webyra.com",
    },
  });

  // Create customers
  const customers = await prisma.customers.createMany({
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
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[0].id,
        number: `2025-10-01-${customerList[0].id}`,
        amount: 4500,
        status: "PAID",
        // issuedAt: new Date("2025-10-01"),
        dueDate: new Date("2025-10-10"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[1].id,
        number: `2025-10-01-${customerList[1].id}`,
        amount: 3000,
        status: "PENDING",
        // issuedAt: new Date("2025-10-15"),
        dueDate: new Date("2025-11-01"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[2].id,
        number: `2025-10-01-${customerList[2].id}`,
        amount: 1200,
        status: "PAID",
        // issuedAt: new Date("2025-09-20"),
        dueDate: new Date("2025-09-25"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[3].id,
        number: `2025-10-01-${customerList[3].id}`,
        amount: 800,
        status: "PAID",
        // issuedAt: new Date("2025-08-15"),
        dueDate: new Date("2025-08-30"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[0].id,
        number: `2025-10-01-${customerList[0].id}`,
        amount: 1500,
        status: "PENDING",
        // issuedAt: new Date("2025-11-05"),
        dueDate: new Date("2025-11-20"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[2].id,
        number: `2025-10-01-${customerList[2].id}`,
        amount: 2700,
        status: "PAID",
        // issuedAt: new Date("2025-09-10"),
        dueDate: new Date("2025-09-20"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[4].id,
        number: `2025-10-01-${customerList[4].id}`,
        amount: 2700,
        status: "PAID",
        // issuedAt: new Date("2025-09-10"),
        dueDate: new Date("2025-09-20"),
      },
    }),
    prisma.invoices.create({
      data: {
        businessId: business.id,
        customerId: customerList[5].id,
        number: `2025-10-01-${customerList[5].id}`,
        amount: 2700,
        status: "PAID",
        // issuedAt: new Date("2025-09-10"),
        dueDate: new Date("2025-09-20"),
      },
    }),
  ]);

    // Create revenues (based on paid invoices)
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

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

  console.log("✅ Seed completed successfully!");
  console.log({
    user: user.email,
    organization: organization.name,
    business: business.name,
    customers: customerList.length,
    invoices: invoices.length,
    paidRevenues: paidInvoices.length
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
