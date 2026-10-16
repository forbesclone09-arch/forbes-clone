import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";

import { featuredArticle, type Article } from "@/data/content";

// Full-bleed cover hero: edge-to-edge photo with the story text overlaid
// on a bottom gradient, like a magazine cover.
export function FeaturedHero({ article }: { article?: Article } = {}) {
  const active = article ?? featuredArticle;
  if (!active) return null;

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative isolate h-[72vh] min-h-[540px] w-full overflow-hidden sm:h-[84vh] sm:min-h-[640px]"
    >
      <img
        src={active.image}
        alt={active.title}
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Bottom gradient for legibility, plus a light top scrim under the header */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/45 to-foreground/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-foreground/70 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-[1240px] px-5 pb-10 sm:px-8 sm:pb-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="kicker text-brand">Daily Cover</span>
              <span className="text-[0.72rem] tracking-[0.1em] text-hero-ink-soft uppercase">
                {active.category}
              </span>
            </div>

            <h1
              id="featured-heading"
              className="headline mt-4 text-[2rem] text-hero-ink sm:text-[2.7rem] lg:text-[3.4rem]"
            >
              <Link
                to="/article/$slug"
                params={{ slug: active.slug }}
                className="transition-colors hover:text-hero-ink-soft"
              >
                {active.title}
              </Link>
            </h1>

            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-hero-ink-soft sm:text-[1.05rem]">
              {active.deck}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-semibold text-hero-ink">{active.author.name}</span>
              <span aria-hidden="true" className="text-hero-ink-soft">
                &middot;
              </span>
              <span className="text-hero-ink-soft">{active.author.title}</span>
              <span
                aria-hidden="true"
                className="hidden h-3 w-px bg-hero-ink-soft sm:block"
              />
              <span className="hidden text-[0.78rem] text-hero-ink-soft sm:inline">
                {active.published}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-hero-ink-soft">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {active.readTime} min read
              </span>
              <Link
                to="/article/$slug"
                params={{ slug: active.slug }}
                className="ml-auto inline-flex items-center gap-1.5 text-[0.78rem] font-semibold tracking-[0.08em] text-hero-ink uppercase underline-offset-4 hover:underline"
              >
                Read the full story
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
