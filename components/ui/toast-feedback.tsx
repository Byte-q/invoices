"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

/**
 * A client component that reads search parameters and displays a toast message.
 * It cleans the URL after displaying the toast to prevent re-toasting.
 */
export default function ToastFeedback({ status }: { status: string | undefined }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'customerCreated') {
      toast.success("Customer created successfully!");
      
      // 🔑 CRUCIAL: Clean the URL to prevent the toast from reappearing on refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('status');
      
      // Use replace to update the URL without adding a new entry to the history
      router.replace(`?${newSearchParams.toString()}`);
    }
  }, [status, router, searchParams]); 

  // This component renders nothing visible
  return null;
}