"use client";

import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Mail } from "lucide-react";
import { Button } from "@/app/ui/button";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/lib/actions";
import { State } from "@/app/lib/schemas";

const SUCCESS_MESSAGE = "Customer created successfully.";
export default function Form() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createCustomer, initialState);

  const router = useRouter();

  const isSuccess = state.message === SUCCESS_MESSAGE;
  useEffect(() => {
    // This effect runs whenever isSuccess or state.message changes.
    if (isSuccess) {
      // 1. Show Toast (Side Effect)
      toast.success(SUCCESS_MESSAGE);

      // 2. Navigate after a short delay (Side Effect)
      // The 500ms delay allows the user to see the toast before navigation.
      setTimeout(() => {
        router.push("/dashboard/customers");
      }, 500);
    } else if (state.message) {
      // Handle error messages
      toast.error(state.message);
    }
  }, [isSuccess, state.message, router]);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-600 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            customer name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Customer Name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 dark:bg-gray-800 placeholder:text-gray-500"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            customer email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                step="0.01"
                placeholder="Customer Email"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 dark:bg-gray-800 placeholder:text-gray-500"
                aria-describedby="customer-error"
              />
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
          </div>
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">
          Create {/* You can use a useFormStatus hook here for loading state */}
        </Button>
      </div>
    </form>
  );
}
