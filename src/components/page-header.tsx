import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div className="measure">
        {kicker ? <p className="type-label">{kicker}</p> : null}
        <h1 className={kicker ? "mt-2 type-2xl text-fg" : "type-2xl text-fg"}>{title}</h1>
        {lede ? <p className="mt-3 type-base text-muted">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
