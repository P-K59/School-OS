import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glow";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variants = {
      default: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-100",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200/90 border border-slate-200/80",
      outline: "border border-slate-300/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
      destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
      glow: "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-md shadow-indigo-200 hover:opacity-95",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8.5 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-6 text-sm",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
