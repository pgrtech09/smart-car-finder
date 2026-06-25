import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses = {
  primary: "bg-gradient-brand text-white shadow-glow hover:opacity-90",
  secondary: "bg-surface-700 text-white border border-white/10 hover:bg-surface-600",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
  success: "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30",
};

const sizeClasses = {
  sm: "py-2 px-3 text-xs rounded-lg gap-1.5",
  md: "py-2.5 px-4 text-sm rounded-xl gap-2",
  lg: "py-3.5 px-6 text-base rounded-xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
