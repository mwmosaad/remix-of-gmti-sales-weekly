import { useEffect, useState } from "react";

export interface RegionNavItem {
  id: string;
  label: string;
  count?: number;
}

export function RegionNav({ items }: { items: RegionNavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        });
        const first = items.find((i) => visible.has(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav
      aria-label="Edition sections"
      className="sticky top-0 z-30 border-b border-border bg-paper"
    >
      <ul className="mx-auto flex max-w-5xl flex-nowrap gap-5 overflow-x-auto whitespace-nowrap px-5">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                onClick={(e) => onClick(e, item.id)}
                aria-current={isActive ? "true" : undefined}
                className={`inline-block border-b-2 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-signal text-signal"
                    : "border-transparent text-ink hover:text-signal"
                }`}
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {item.count}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
