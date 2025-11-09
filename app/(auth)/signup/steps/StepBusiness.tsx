// app/(auth)/signup/steps/StepBusiness.tsx
'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";

type Props = {
  organizationId: string | null;
  onBack: () => void;
  onSuccess: (businessId: string, values: { name: string; industry?: string }) => void;
};

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  industry: z.string().min(2, "Industry too short"),
});

type FormData = z.infer<typeof schema>;

export default function StepBusiness({ organizationId, onBack, onSuccess }: Props) {
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
      const res = await fetch("/api/signup/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to create business");
        setLoading(false);
        return;
      }

      onSuccess(data.id, {
        name: values.name,
        industry: values.industry,
      });
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-2">Business name</label>
          <input {...register('name')} className={`w-full p-3 rounded-xl bg-white/5 text-white outline-none border ${errors.name ? 'border-red-400' : 'border-white/6'}`} placeholder="Alaa" />
          {errors.name && <p className="text-xs text-red-300 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-2">Industry name</label>
          <input {...register('industry')} className={`w-full p-3 rounded-xl bg-white/5 text-white outline-none border ${errors.industry ? 'border-red-400' : 'border-white/6'}`} placeholder="Mohammed" />
          {errors.industry && <p className="text-xs text-red-300 mt-1">{errors.industry.message}</p>}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-between mt-4">
          <div />
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-black font-semibold shadow-md">
            {loading ? 'Creating...' : 'Next — Create business'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
