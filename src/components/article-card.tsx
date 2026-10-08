import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import type { Article } from "@/data/content";
import { cn } from "@/lib/utils";

export function CategoryKicker({
  category,
  className,
}: {
  category: Article["category"];
  className?: string;
}) {
  return (
    <span className={cn("kicker", className)}>{category}</span>
  );
}

function Byline({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] text-ink-soft">
      <span className="font-semibold text-foreground/90">{article.author.name}</span>
      <span aria-hidden="true">&middot;</span>
      <span>{article.published}</span>
      <span aria-hidden="true">&middot;</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden="true" />
        {article.readTime} min read
      </span>
    </div>
  );
}

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col">
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="block overflow-hidden bg-paper"
        tabIndex={-1}
      >
        <img
          src={article.image}
          alt={article.title}
          width={944}
          height={704}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <Link
          to="/article/$slug"
          params={{ slug: article.slug }}
          className="flex flex-1 flex-col"
        >
          <CategoryKicker category={article.category} />
          <h3 className="headline mt-2 text-[1.2rem] text-foreground transition-colors group-hover:text-brand sm:text-[1.32rem]">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[0.875rem] leading-relaxed text-ink-soft">
            {article.deck}
          </p>
          <div className="mt-auto pt-4">
            <Byline article={article} />
          </div>
        </Link>
      </div>
    </article>
  );
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_88px] items-start gap-4 border-b border-rule py-5 last:border-b-0">
      <div className="min-w-0">
        <CategoryKicker category={article.category} />
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <h3 className="headline mt-1.5 text-[1.05rem] text-foreground transition-colors group-hover:text-brand">
            {article.title}
          </h3>
        </Link>
        <div className="mt-2">
          <Byline article={article} />
        </div>
      </div>
      <Link to="/article/$slug" params={{ slug: article.slug }} tabIndex={-1} className="block">
        <img
          src={article.image}
          alt={article.title}
          width={944}
          height={704}
          loading="lazy"
          className="h-[68px] w-[88px] object-cover"
        />
      </Link>
    </article>
  );
}

export function SectionHeading({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="mb-8 border-b-2 border-foreground pb-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="headline text-[1.5rem] text-foreground sm:text-[1.75rem]">{title}</h2>
        {kicker && <span className="kicker shrink-0">{kicker}</span>}
      </div>
    </div>
  );
}
