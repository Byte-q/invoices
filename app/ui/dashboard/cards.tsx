import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
  overDue: InformationCircleIcon,
};

export default async function CardWrapper() {
   const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
    numberOfOverdueInvoices,
  } = await fetchCardData();
  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Over due" value={numberOfOverdueInvoices} type="overDue" />
      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card
        title="Total Customers"
        value={numberOfCustomers}
        type="customers"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'customers' | 'pending' | 'collected' | 'overDue';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-card p-2 shadow border">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl border dark:bg-neutral-950 bg-neutral-50 px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
