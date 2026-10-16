import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { articlesByCategory, categoryFeatures, type Article, type CategoryName } from "@/data/content";
import { cn } from "@/lib/utils";

function CoverStory({ article, lead = false }: { article: Article; lead?: boolean }) {
  return (
    <article className={cn("group relative isolate min-w-0 overflow-hidden bg-photo-scrim", lead ? "min-h-[360px] sm:min-h-[440px] lg:min-h-0" : "min-h-[230px] lg:min-h-0")}>
      <Link to="/article/$slug" params={{ slug: article.slug }} className="relative flex h-full min-h-[inherit] items-end focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-hero-ink">
        <img src={article.image} alt="" width={944} height={704} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-photo-scrim via-photo-scrim/35 to-transparent" />
        <div className={cn("w-full p-5 text-hero-ink", lead && "sm:p-7")}>
          <span className="text-[0.6875rem] font-medium">{article.category}</span>
          <h3 className={cn("mt-2 font-display font-semibold leading-[1.15] text-pretty", lead ? "text-[1.7rem] sm:text-[2rem]" : "text-[1.2rem] sm:text-[1.3rem]")}>{article.title}</h3>
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-hero-ink-soft">By <span className="font-medium text-hero-ink">{article.author.name}</span></p>
        </div>
      </Link>
    </article>
  );
}

function CompactStory({ article }: { article: Article }) {
  return (
    <article className="group min-w-0 border-b border-rule pb-6">
      <Link to="/article/$slug" params={{ slug: article.slug }} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3">
        <img src={article.image} alt="" width={88} height={88} loading="lazy" className="aspect-square w-full object-cover" />
        <div className="min-w-0">
          <h3 className="font-display text-[1.125rem] font-medium leading-[1.2] transition-colors group-hover:text-brand">{article.title}</h3>
          <p className="mt-2 text-[0.625rem] leading-relaxed text-ink-soft">By <span className="text-foreground">{article.author.name}</span><span className="ml-2">{article.author.title}</span></p>
        </div>
      </Link>
    </article>
  );
}

export function CategoryMosaic({ category, articles }: { category: CategoryName; articles?: Article[] }) {
  const defaultLead = categoryFeatures.find((article) => article.category === category);
  const defaultStories = articlesByCategory(category).filter((article) => article.slug !== defaultLead?.slug);

  const categoryMatches = articles
    ? articles.filter((a) => a.category?.toLowerCase() === category.toLowerCase())
    : [];

  const lead = categoryMatches[0] ?? defaultLead;
  if (!lead) return null;

  const remainingDynamic = categoryMatches.slice(1);
  const stories = [
    ...remainingDynamic,
    ...defaultStories.filter(
      (ds) => ds.slug !== lead.slug && !remainingDynamic.some((rd) => rd.slug === ds.slug)
    ),
  ];

  return (
    <section aria-label={`${category} stories`} className="mt-16 sm:mt-20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-[1.75rem] font-semibold">{category}</h2>
        <Link to="/category/$category" params={{ category: category.toLowerCase() }} className="flex items-center gap-1 text-xs font-medium hover:text-brand" aria-label={`View all ${category} stories`}>View all <ChevronRight className="size-3.5 text-brand" aria-hidden="true" /></Link>
      </div>
      <div className="grid gap-6 lg:h-[460px] lg:grid-cols-[minmax(0,1fr)_minmax(0,2.08fr)]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
          {stories.slice(0, 2).map((article) => <CoverStory key={article.slug} article={article} />)}
        </div>
        <CoverStory article={lead} lead />
      </div>
      <div className="mt-7 grid gap-6 border-t border-rule pt-7 sm:grid-cols-2 lg:grid-cols-3">
        {stories.slice(2, 5).map((article) => <CompactStory key={article.slug} article={article} />)}
      </div>
    </section>
  );
}