import * as React from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-input bg-[#17191c] px-3 py-2 text-sm text-[#ECECEC] outline-none transition placeholder:text-[#ECECEC]/45 focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
