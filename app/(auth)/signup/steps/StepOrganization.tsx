// app/(auth)/signup/steps/StepOrganization.tsx
'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";

type Props = {
  userId: string | null;
  onBack: () => void;
  onSuccess: (orgId: string, values: { name: string; description?: string }) => void;
};

export default function StepOrganization({ userId, onBack, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string) || '';
    const description = (formData.get('description') as string) || '';

    try {
      const res = await fetch('/api/signup/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, ownerId: userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || 'Failed to create organization');
      }

      const data = await res.json();
      onSuccess(data.id, { name, description });
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/80 mb-2">Organization name</label>
        <input required name="name" className="w-full p-3 rounded-xl bg-white/5 text-white outline-none border border-white/6" placeholder="Webyra Ltd" />
      </div>

      <div>
        <label className="block text-sm text-white/80 mb-2">Short description (optional)</label>
        <input name="description" className="w-full p-3 rounded-xl bg-white/5 text-white outline-none border border-white/6" placeholder="A short description" />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between mt-4">
        <button onClick={onBack} type="button" className="px-4 py-2 rounded-xl border border-white/8 text-white/90">Back</button>
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-black font-semibold shadow-md">
          {loading ? 'Creating...' : 'Next — Create organization'}
        </button>
      </div>
    </form>
  );
}
