import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium tracking-tight transition-all duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-olive text-canvas hover:bg-olive-deep": variant === "primary",
            "border border-ink/20 text-ink hover:border-ink/40 hover:bg-ink/[0.02]":
              variant === "outline",
            "text-ink hover:text-olive": variant === "ghost",
          },
          {
            "h-9 px-4 text-[13px] rounded-md": size === "sm",
            "h-11 px-6 text-sm rounded-md": size === "md",
            "h-13 px-8 text-[15px] rounded-lg py-3.5": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
