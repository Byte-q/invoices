// app/(auth)/signup/steps/StepFinish.tsx
'use client';

import { useRouter } from 'next/navigation';

type Props = {
  summary: {
    user?: { name: string; email: string };
    organization?: { name: string; description?: string };
    business?: { name: string; industry?: string };
  } | null;
};

export default function StepFinish({ summary }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg text-white font-semibold">All set — your workspace is ready</h2>
        <p className="text-sm text-white/80 mt-1">We created your account, organization and business.</p>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/6">
        <div className="text-white/90 font-medium">{summary?.user?.name}</div>
        <div className="text-sm text-white/70">{summary?.user?.email}</div>
        <hr className="my-3 border-white/6" />
        <div className="text-sm text-white/90 font-semibold">{summary?.organization?.name}</div>
        <div className="text-sm text-white/70">{summary?.organization?.description}</div>
        <hr className="my-3 border-white/6" />
        <div className="text-sm text-white/90 font-semibold">{summary?.business?.name}</div>
        <div className="text-sm text-white/70">{summary?.business?.industry}</div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button onClick={() => router.push('/dashboard')} className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-black font-semibold shadow-md">
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
