// app/(auth)/signup/SignupFlowClient.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import StepAccount from './steps/StepAccount';
import StepOrganization from './steps/StepOrganization';
import StepBusiness from './steps/StepBusiness';
import StepFinish from './steps/StepFinish';

export default function SignupFlowClient() {
  const [step, setStep] = useState<number>(1);

  // store created entities' ids
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  const container = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
  };

  return (
    <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/5">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">Create your account</h1>
        <p className="text-sm text-white/75 mt-1">Quick setup — we&apos;ll create your user, organization and business.</p>
      </div>

      <div className="relative min-h-[360px]">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div key="s1" variants={container} initial="hidden" animate="show" exit="exit">
              <StepAccount
                onSuccess={(id, values) => {
                  setUserId(id);
                  setSummary((prev: any) => ({ ...prev, user: values }));
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={container} initial="hidden" animate="show" exit="exit">
              <StepOrganization
                userId={userId}
                onBack={() => setStep(1)}
                onSuccess={(id, values) => {
                  setOrganizationId(id);
                  setSummary((prev: any) => ({ ...prev, organization: values }));
                  setStep(3);
                }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={container} initial="hidden" animate="show" exit="exit">
              <StepBusiness
                organizationId={organizationId}
                onBack={() => setStep(2)}
                onSuccess={(id, values) => {
                  setSummary((prev: any) => ({ ...prev, business: values }));
                  setStep(4);
                }}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={container} initial="hidden" animate="show" exit="exit">
              <StepFinish summary={summary} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 text-sm text-white/60">
        Step {step} of 4
        <div className="h-2 bg-white/10 rounded-full mt-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition duration-700"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
