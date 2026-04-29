import * as React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-input bg-[#17191c] px-3 text-sm text-[#ECECEC] outline-none transition placeholder:text-[#ECECEC]/45 focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
