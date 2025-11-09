import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { fetchCustomersPages } from "@/app/lib/data";
import { Metadata } from "next";
import CustomersTable from "@/app/ui/customers/table";
import Pagination from "@/app/ui/invoices/pagination";

export const metadata: Metadata = {
  title: "Customers",
};



export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  

  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between"></div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <CustomersTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
