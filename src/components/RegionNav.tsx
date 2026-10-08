import { useEffect, useRef, useState } from "react";

export interface RegionNavItem {
  id: string;
  label: string;
  count?: number;
}

export function RegionNav({ items }: { items: RegionNavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
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

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 1);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [key]);

  // Keep the active link visible inside the bar.
  useEffect(() => {
    if (!active || !listRef.current) return;
    const link = listRef.current.querySelector<HTMLElement>(`a[href="#${active}"]`);
    link?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [active]);

  const scrollBy = (dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

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
      <div className="relative mx-auto max-w-5xl">
        <ul
          ref={listRef}
          className="flex flex-nowrap gap-5 overflow-x-auto whitespace-nowrap px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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
                      {item.count === 0 ? "news" : item.count}
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
        {canLeft ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center bg-gradient-to-r from-paper via-paper/90 to-transparent">
            <button
              type="button"
              aria-label="Scroll sections left"
              onClick={() => scrollBy(-1)}
              className="pointer-events-auto ml-1 grid h-7 w-7 place-items-center rounded-full text-lg leading-none text-ink hover:text-signal"
            >
              ‹
            </button>
          </div>
        ) : null}
        {canRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-paper via-paper/90 to-transparent">
            <button
              type="button"
              aria-label="Scroll sections right"
              onClick={() => scrollBy(1)}
              className="pointer-events-auto mr-1 grid h-7 w-7 place-items-center rounded-full text-lg leading-none text-ink hover:text-signal"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
