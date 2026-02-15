import type { ReactNode } from "react";

export type CardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  glow?: boolean;
};

export default function Card({
  title,
  description,
  icon,
  className = "",
  glow = true,
}: CardProps) {
  const classes = ["ui-card", glow ? "ui-card--glow" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {glow && <div className="ui-card__glow" />}
      <div className="ui-card__content">
        {icon && <div className="ui-card__icon">{icon}</div>}
        <div className="ui-card__text">
          <h3 className="ui-card__title">{title}</h3>
          <p className="ui-card__description">{description}</p>
        </div>
      </div>
    </div>
  );
}
