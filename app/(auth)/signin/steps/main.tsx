// app/(auth)/signup/steps/StepAccount.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function StepMain() {
  const router = useRouter(); // Initialize router hook

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: FormData) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to sign in");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS: Redirect the user to the dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Email</label>
          <input
            {...register("email")}
            type="email"
            className={`w-full p-3 rounded-xl bg-white/5 text-white outline-none border ${
              errors.email ? "border-red-400" : "border-white/6"
            }`}
            placeholder="you@company.com"
          />
          {errors.email && (
            <p className="text-xs text-red-300 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">Password</label>
          <input
            {...register("password")}
            type="password"
            className={`w-full p-3 rounded-xl bg-white/5 text-white outline-none border ${
              errors.password ? "border-red-400" : "border-white/6"
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-red-300 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-between mt-4">
          <div />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 cursor-pointer hover:bg-blue-600 transition duration-300 text-black font-semibold shadow-md"
          >
            {loading ? "signing..." : "signin"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
