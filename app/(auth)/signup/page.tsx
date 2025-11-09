// app/(auth)/signup/page.tsx
import SignupFlowClient from "./SignupFlowClient";

export const metadata = {
  title: 'Sign up — Webyra',
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#081129] to-[#04213f] p-6">
      <SignupFlowClient />
    </main>
  );
}
