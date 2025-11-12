import { generateYAxis } from "@/app/lib/utils";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import { Revenue } from "@/app/lib/definitions";
import { fetchRevenue } from "@/app/lib/data";
import { months } from "@/app/lib/placeholder-data";

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  // Make component async, remove the props
  let revenue = await fetchRevenue(); // Fetch data inside the component
  const chartHeight = 350;

  let yAxisLabels, topLabel;

  if (!revenue || revenue.length === 0) {
    // 1. Create a placeholder array with 12 months, all revenue set to 0.
    revenue = Array.from({ length: 12 }, (_, i) => ({
      month: months[i], // Placeholder month label
      revenue: 0,
    }));
    // 2. Since revenue is 0, we can manually set the topLabel to 0 and yAxisLabels to ['$', '$0'].
    // Note: If generateYAxis handles a zero input, you could use that instead.
    // Assuming a simple manual override is needed for the $0 display.
    topLabel = 2;
    yAxisLabels = ["$0K", "$0K", "$0K", "$0K", "$0K", "$0K"];
  } else {
    // Use the fetched data and generate the axis labels normally
    const yAxisData = generateYAxis(revenue);
    yAxisLabels = yAxisData.yAxisLabels;
    topLabel = yAxisData.topLabel;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-600 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white dark:bg-gray-800 p-4 md:gap-4">
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 dark:text-white sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {revenue.map((month) => (
            <div key={month.month} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topLabel) * (month.revenue === 0 ? 1 : month.revenue)}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 dark:text-white sm:rotate-0">
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
      </div>
    </div>
  );
}
