import { FileUpload } from "@/components/ui/file-upload";
import { UserPlusIcon } from "lucide-react";
import React from "react";

export default function ImageUpload({
  state,
  className,
}: {
  state:
    | {
        errors: {
          [x: string]: string[] | undefined;
        };
        message: string;
      }
    | {
        message: string;
        errors?: undefined;
      };
  className?: string;
}) {
  return (
    <div>
      <FileUpload />
      {/* <div className={`${className} mt-4`}>
        <label
          className="mb-3 mt-5 block text-xs font-medium text-gray-900"
          htmlFor="password"
        >
          Image Url
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
            id="image"
            type="text"
            name="image"
            placeholder="Enter image url"
            required
            minLength={6}
          />
          <UserPlusIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
        <div id="image-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image &&
            state.errors.image.map((error: string) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div> */}
    </div>
  );
}
