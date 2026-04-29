import * as React from "react";
import { cn } from "../../lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-input bg-[#17191c] px-3 text-sm text-[#ECECEC] outline-none transition focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
