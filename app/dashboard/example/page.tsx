"use client";

import SignupFormDemo from "@/components/signup-form-demo";
import { UploadButton } from "@/utils/uploadthing";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button
        type="button"
        onClick={() => {
          throw new Error("Sentry Test Error");
        }}
      >
        Break the world
      </button>
      ;
    </main>
  );
}
