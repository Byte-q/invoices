import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dueDate: Date,
  locale: string = 'en-US',
) => {
  const date = new Date(dueDate);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

// A utility function you can place in a file like 'app/lib/utils.js'

/**
 * Checks if the invoice due date has passed today's date.
 * @param {Date | string | null | undefined} dueDateFromInvoice - The dueDate field from your Prisma invoice object.
 * @returns {boolean} True if the invoice is overdue.
 */
export function isInvoiceOverdue(dueDateFromInvoice: Date) {
  if (!dueDateFromInvoice) {
    return false; // Cannot be overdue if there is no due date
  }

  // 1. Ensure it's a Date object (Prisma returns Date, but check for safety)
  const dueDate = new Date(dueDateFromInvoice);

  // 2. Get today's date, set the time to midnight (00:00:00) to ensure a fair comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Get the due date, also set to midnight for comparison
  const dueDateOnly = new Date(dueDate);
  dueDateOnly.setHours(0, 0, 0, 0);

  // An invoice is overdue if the due date is strictly before today.
  // We use < here because we want it to be considered overdue *starting* the day after the due date.
  return dueDateOnly < today;
}
