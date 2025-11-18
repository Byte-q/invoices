import { generateYAxis } from "@/app/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTable, Revenue } from "@/app/lib/definitions";
import {
  fetchChartInvoices,
  fetchInvoices,
  fetchMonthlyRevenue,
  fetchRevenue,
} from "@/app/lib/data";
import { months } from "@/app/lib/placeholder-data";
import { ChartAreaInteractive } from "@/components/ui/wideChart";
import { RevenueExpenseChart } from "@/components/ui/RevenueChart";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  const invoices = fetchInvoices();
  const monthlyRevenueData = await fetchMonthlyRevenue();
  // Make component async, remove the props
  // const revenue = await fetchRevenue(); // Fetch data inside the component
  const { yAxisLabels, topLabel } = generateYAxis(monthlyRevenueData);
  const chartHeight = 350;

  const chartInvoices = await fetchChartInvoices();
  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      {/* <div className="rounded-xl bg-card border shadow p-3">
        <div className="sm:grid-cols-14 mt-0 grid grid-cols-12 items-end gap-2 rounded-md p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col gap-5 justify-between text-xs sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label} className="text-xs">
                {label}
              </p>
            ))}
          </div>
          <div></div>
          {monthlyRevenueData.map((month) => (
            <div key={month.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${
                    (chartHeight / topLabel) *
                    (month.revenue === 0 ? 1 : month.revenue)
                  }px`,
                }}
              ></div>
              <p className="-rotate-90 text-xs text-gray-400 dark:text-white sm:rotate-0">
                {month.month}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-white" />
          <h3 className="ml-2 text-sm text-gray-500 dark:text-white">
            Last 12 months
          </h3>
        </div>
      </div> */}
      <RevenueExpenseChart invoices={chartInvoices} />
    </div>
  );
}
