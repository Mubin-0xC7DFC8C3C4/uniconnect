import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-line bg-surface text-fg hover:bg-sunken",
  ghost: "bg-transparent text-fg hover:bg-sunken",
  danger: "border border-line bg-surface text-danger hover:bg-sunken",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  asChild = false,
  className,
  type = "button",
  ...props
}: Props) {
  const classes = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 px-4 type-sm font-medium r-md transition-ui",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );
  if (asChild) {
    return <Slot className={classes} {...props} />;
  }
  return <button type={type} className={classes} {...props} />;
}
