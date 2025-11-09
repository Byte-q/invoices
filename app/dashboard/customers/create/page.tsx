import Form from '@/app/ui/customers/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
 
export const metadata: Metadata = {
  title: 'Create',
};

const USER_ID_COOKIE = "userId";
 
export default async function Page() {
  const cookieStore = await cookies();
    const userId = cookieStore.get(USER_ID_COOKIE)?.value;
    if (!userId) {
      // If the cookie is missing or invalid, redirect to the login page
      redirect("/signin");
    }

  const customers = await fetchCustomers(userId);
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/customer' },
          {
            label: 'Create Customer',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}