'use client'

import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteInvoice } from "@/app/lib/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function SendReminderEmail({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/send-email?id=${id}`}
      className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
    >
      <PaperAirplaneIcon className="w-5" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const router = useRouter();

  // 🔑 Call the Server Action directly
  const deleteInvoiceWithId = async () => {
    // Add confirmation dialogue here if desired

    const response = await deleteInvoice(id);

    if (response.message === "Invoice deleted successfully.") {
      toast.success(response.message);
      // As discussed, router.refresh() updates the list on the client
      router.refresh(); 
    } else if (response.message) {
      toast.error(response.message);
    } else {
      toast.error("An unknown error occurred during deletion.");
    }
  };

  return (
    <button 
      onClick={deleteInvoiceWithId} 
      className="rounded-md border cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
      aria-label={`Delete invoice ${id}`}
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
