import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  solid: "ui-button--solid",
  outline: "ui-button--outline",
  ghost: "ui-button--ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "ui-button--sm",
  md: "ui-button--md",
  lg: "ui-button--lg",
};

export default function Button({
  variant = "solid",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "ui-button",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
