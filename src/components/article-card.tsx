import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, BookOpen } from "lucide-react";

import type { Article } from "@/data/content";
import { cn } from "@/lib/utils";

export function CategoryKicker({
  category,
  className,
}: {
  category: Article["category"];
  className?: string;
}) {
  const isCover = category === "Cover Feature" || category?.toLowerCase() === "magazine cover";
  return (
    <span className={cn(
      "kicker",
      isCover && "text-red-600 font-bold tracking-wider",
      className
    )}>
      {category}
    </span>
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
  const isExplicitCover =
    article.aspect_ratio === "3:4" ||
    article.is_cover ||
    article.category === "Cover Feature" ||
    article.category?.toLowerCase() === "magazine cover";

  const [isPortrait, setIsPortrait] = useState<boolean>(isExplicitCover);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth * 1.12) {
      setIsPortrait(true);
    }
  };

  const isCoverStyle = isExplicitCover || isPortrait;

  return (
    <article className="group flex flex-col">
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className={cn(
          "relative block overflow-hidden transition-all duration-300",
          isCoverStyle
            ? "aspect-[3/4] rounded-sm bg-neutral-900/5 shadow-md ring-1 ring-black/10 group-hover:-translate-y-1 group-hover:shadow-2xl dark:ring-white/10"
            : "aspect-[4/3] bg-paper"
        )}
        tabIndex={-1}
      >
        <img
          src={article.image}
          alt={article.title}
          width={944}
          height={isCoverStyle ? 1258 : 704}
          loading="lazy"
          onLoad={handleImageLoad}
          className={cn(
            "w-full h-full transition-transform duration-500 ease-out",
            isCoverStyle
              ? "object-contain bg-zinc-950/5 group-hover:scale-[1.02]"
              : "object-cover group-hover:scale-[1.03]"
          )}
        />
        {isCoverStyle && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 shadow-sm">
            <span className="inline-flex items-center gap-1 bg-red-600 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white">
              <BookOpen className="size-2.5" /> Cover Feature
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <Link
          to="/article/$slug"
          params={{ slug: article.slug }}
          className="flex flex-1 flex-col"
        >
          <div className="flex items-center gap-2">
            <CategoryKicker category={article.category} />
            {isCoverStyle && (
              <span className="text-[0.65rem] font-mono uppercase tracking-wider text-red-600 font-semibold">
                3:4 Magazine
              </span>
            )}
          </div>
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
  const isExplicitCover =
    article.aspect_ratio === "3:4" ||
    article.is_cover ||
    article.category === "Cover Feature" ||
    article.category?.toLowerCase() === "magazine cover";

  const [isPortrait, setIsPortrait] = useState<boolean>(isExplicitCover);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth * 1.12) {
      setIsPortrait(true);
    }
  };

  const isCoverStyle = isExplicitCover || isPortrait;

  return (
    <article className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-rule py-5 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <CategoryKicker category={article.category} />
          {isCoverStyle && (
            <span className="text-[0.62rem] font-mono uppercase tracking-wider text-red-600 font-semibold">
              Cover
            </span>
          )}
        </div>
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <h3 className="headline mt-1.5 text-[1.05rem] text-foreground transition-colors group-hover:text-brand">
            {article.title}
          </h3>
        </Link>
        <div className="mt-2">
          <Byline article={article} />
        </div>
      </div>
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        tabIndex={-1}
        className={cn(
          "block overflow-hidden transition-all",
          isCoverStyle
            ? "h-[88px] w-[66px] aspect-[3/4] rounded-sm shadow-sm ring-1 ring-black/10 group-hover:shadow-md"
            : "h-[68px] w-[88px]"
        )}
      >
        <img
          src={article.image}
          alt={article.title}
          width={isCoverStyle ? 66 : 88}
          height={88}
          loading="lazy"
          onLoad={handleImageLoad}
          className={cn(
            "w-full h-full",
            isCoverStyle ? "object-contain bg-zinc-950/5" : "object-cover"
          )}
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
