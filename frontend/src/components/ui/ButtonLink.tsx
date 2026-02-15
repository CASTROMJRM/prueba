import { Link, type LinkProps } from "react-router-dom";
import type { ButtonSize, ButtonVariant } from "./Button";

export type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
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

export default function ButtonLink({
  variant = "solid",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  const classes = [
    "ui-button",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Link className={classes} {...props} />;
}
