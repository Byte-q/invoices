// Example Client Component in Next.js
"use client";
import Link from "next/link";

export default function AuthorizationButton() {
  return (
    <Link href="/api/auth/google/start">
      <button className="p-3 bg-blue-500 text-white rounded-md cursor-pointer">
        Authorize App to Send Gmail
      </button>
    </Link>
  );
}
