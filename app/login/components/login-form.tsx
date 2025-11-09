"use client";

import { lusitana } from "@/app/ui/fonts";
import {
  UserCircleIcon,
  AtSymbolIcon,
  KeyIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { createUser } from "@/app/lib/actions";
import { UploadButton } from "@/utils/uploadthing";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import UserData from "./userData";
import ImageUpload from "./image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function LoginForm({ query }: { query: string }) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  params.set("query", "userData");

  const handleSubmit = () => {
    if (query === "userData") {
      params.set("query", "imageUpload");
    } else if (query === "imageUpload") {
      params.set("query", "business");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  type State = {
    errors?: {
      name?: string[];
      email?: string[];
      password?: string[];
      image?: string[];
    };
    message?: string | null;
  };

  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createUser, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          {query === "userData"
            ? "Please Enter your data."
            : query === "imageUpload"
            ? "Did you want Profile pic?"
            : ""}
        </h1>
        <div className="w-full">
          {query === "userData" ? (
            <UserData state={state} />
          ) : (
            <ImageUpload state={state} />
          )}

          <div className="relative text-center mt-5">
            {query === "end" ? (
              <Button
                type="submit"
                onClick={() => handleSubmit}
                className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 transition duration-200"
              >
                Sign up
              </Button>
            ) : (
              <Button
                onClick={() => handleSubmit}
                className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 transition duration-200"
              >
                Next
              </Button>
            )}
          </div>
        </div>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        ></div>
      </div>
    </form>
  );
}
