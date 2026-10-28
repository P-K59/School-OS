import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "cyan" | "purple";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-indigo-50 text-indigo-700 border-indigo-200/80 font-semibold",
    secondary: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
    destructive: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    outline: "text-slate-800 border-slate-300 font-medium",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold",
    purple: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs transition-colors shadow-xs",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
