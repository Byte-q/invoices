"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  name: string; // The key for your form data
  defaultDate?: Date | null; // Accept a Date object or null
}

export function DatePicker({ name, defaultDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate || undefined
  );

  // Function to format the date for display (MM/DD/YYYY)
  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "Select date";

  return (
    <div className="flex flex-col gap-3">
      {/* <Label htmlFor="date" className="px-1">
        Date of birth
      </Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full justify-between font-normal"
          >
            {/* 💡 Use the formatted string for display in the button */}
            {formattedDate}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" overflow-hidden p-0" align="start">
          <Calendar
            className="w-full"
            mode="single"
            // 💡 Pass the Date object to the calendar
            selected={date || undefined}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {/* 2. 🔑 THE SOLUTION: Hidden Input Field */}
      {/* This input will carry the actual date value in the form submission. */}
      <input
        type="hidden"
        name={name} // **Crucially, this carries the form data key**
        value={date ? date.toISOString().split("T")[0] : ""} // **The formatted date value**
      />
    </div>
  );
}
