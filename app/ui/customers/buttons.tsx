"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { deleteCustomer } from "@/app/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CreateCustomer() {
  return (
    <Link
      href="/dashboard/customers/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Customer</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateCustomer({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/customers/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300"
    >
        <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteCustomer({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const response = await deleteCustomer(id);

    if (response.message === "Customer deleted successfully.") {
      toast.success(response.message);
      router.refresh();
    } else if (response.message) {
      toast.error(response.message);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-md cursor-pointer border p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300"
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}
