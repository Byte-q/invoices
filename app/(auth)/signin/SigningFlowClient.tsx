'use client'

// app/(auth)/signup/SignupFlowClient.tsx
import { AnimatePresence, motion } from "motion/react";
import StepMain from "./steps/main";

export default function SigninFlowClient() {
  const container = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
  };

  return (
    <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/5">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white">
          Create your account
        </h1>
        <p className="text-sm text-white/75 mt-1">
          Quick setup — we&apos;ll create your user, organization and business.
        </p>
      </div>

      <div className="relative min-h-[360px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key="s1"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <StepMain />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
