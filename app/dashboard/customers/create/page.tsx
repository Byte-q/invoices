import Form from "@/app/ui/customers/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import ToastFeedback from "@/components/ui/toast-feedback";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page({
  searchParams,
}: {
  // Next.js passes searchParams to Server Components
  searchParams: { status?: string };
}) {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Customer", href: "/dashboard/customers" },
          {
            label: "Create Customer",
            href: "/dashboard/customers/create",
            active: true,
          },
        ]}
      />
      <Form />
      <Suspense>
        {/* Pass the status to the client component for toast handling */}
        <ToastFeedback status={searchParams.status} />
      </Suspense>
    </main>
  );
}
