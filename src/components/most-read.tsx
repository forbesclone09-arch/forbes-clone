import { Link } from "@tanstack/react-router";

import { SectionHeading } from "@/components/article-card";
import { mostRead } from "@/data/content";

export function MostRead() {
  return (
    <aside aria-label="Most Read">
      <SectionHeading title="Most Read" />

      <ol className="divide-y divide-rule">
        {mostRead.map((item) => (
          <li key={item.rank}>
            <Link
              to="/article/$slug"
              params={{ slug: item.slug }}
              className="group grid grid-cols-[26px_minmax(0,1fr)] items-baseline gap-3 py-4"
            >
              <span
                aria-hidden="true"
                className="font-display text-2xl leading-none text-rule transition-colors group-hover:text-brand"
              >
                {String(item.rank).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="kicker block">{item.category}</span>
                <span className="headline mt-1.5 block text-[1.02rem] text-foreground transition-colors group-hover:text-brand">
                  {item.title}
                </span>
                <span className="mt-1.5 block text-[0.72rem] text-ink-soft">
                  {item.readTime} min read
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
