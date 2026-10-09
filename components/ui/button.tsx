import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "approve"
    | "secondary"
    | "ghost"
    | "gold"
    | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const variantStyles: Record<string, string> = {
    primary: "bg-navy text-white hover:bg-[#1a3278] shadow-card",
    approve: "bg-[#15803D] text-white hover:bg-[#166534] shadow-card",
    secondary:
      "bg-white text-midnight border border-line hover:bg-slate-50 shadow-card",
    ghost: "text-slate-600 hover:bg-slate-100",
    gold: "bg-gold text-midnight hover:bg-amber-400 shadow-card",
    danger:
      "bg-white text-red-600 border border-red-200 hover:bg-reject-bg",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
        variantStyles[variant]
      } ${
        size === "sm" ? "h-11 px-3 text-micro" : "h-11 px-4 text-body"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
