import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

import { featuredArticle, type Article } from "@/data/content";

// Full-bleed cover hero for landscape, or split editorial showcase for 3:4 magazine covers.
export function FeaturedHero({ article }: { article?: Article } = {}) {
  const active = article ?? featuredArticle;
  if (!active) return null;

  const isExplicitCover =
    active.aspect_ratio === "3:4" ||
    active.is_cover ||
    active.category === "Cover Feature" ||
    active.category?.toLowerCase() === "magazine cover";

  const [isPortrait, setIsPortrait] = useState<boolean>(isExplicitCover);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth * 1.12) {
      setIsPortrait(true);
    }
  };

  const isCoverStyle = isExplicitCover || isPortrait;

  if (isCoverStyle) {
    return (
      <section
        aria-labelledby="featured-heading"
        className="relative isolate min-h-[580px] sm:min-h-[640px] w-full overflow-hidden bg-[#0a0b10] text-white py-12 lg:py-16"
      >
        {/* Soft atmospheric blurred background of the cover image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 overflow-hidden opacity-25"
        >
          <img
            src={active.image}
            alt=""
            className="h-full w-full object-cover filter blur-3xl scale-110"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0a0b10] via-[#0a0b10]/95 to-[#0a0b10]/70"
        />

        <div className="mx-auto flex h-full w-full max-w-[1240px] flex-col justify-center px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Story Details */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 bg-red-600 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-sm">
                  <BookOpen className="size-3" /> Magazine Cover Feature
                </span>
                <span className="text-[0.72rem] font-mono tracking-[0.15em] text-zinc-400 uppercase">
                  3:4 Issue Edition
                </span>
              </div>

              <h1
                id="featured-heading"
                className="headline mt-4 text-[2.2rem] text-white sm:text-[3rem] lg:text-[3.6rem] leading-[1.08]"
              >
                <Link
                  to="/article/$slug"
                  params={{ slug: active.slug }}
                  className="transition-colors hover:text-zinc-200"
                >
                  {active.title}
                </Link>
              </h1>

              <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-zinc-300 sm:text-[1.12rem]">
                {active.deck}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-zinc-300">
                <span className="font-semibold text-white">{active.author.name}</span>
                <span aria-hidden="true" className="text-zinc-500">&middot;</span>
                <span className="text-zinc-400">{active.author.title}</span>
                <span aria-hidden="true" className="hidden h-3 w-px bg-zinc-600 sm:block" />
                <span className="hidden text-[0.8rem] text-zinc-400 sm:inline">
                  {active.published}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.8rem] text-zinc-400">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  {active.readTime} min read
                </span>
              </div>

              <div className="mt-8">
                <Link
                  to="/article/$slug"
                  params={{ slug: active.slug }}
                  className="inline-flex items-center gap-2 bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-700 hover:gap-3 shadow-lg"
                >
                  Read Cover Story <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* 3:4 Magazine Cover Container */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <Link
                to="/article/$slug"
                params={{ slug: active.slug }}
                className="group relative block w-full max-w-[380px] aspect-[3/4] overflow-hidden rounded-sm bg-zinc-900 shadow-2xl ring-1 ring-white/15 transition-transform duration-500 hover:scale-[1.02]"
              >
                <img
                  src={active.image}
                  alt={active.title}
                  fetchPriority="high"
                  onLoad={handleImageLoad}
                  className="h-full w-full object-contain bg-zinc-950/40"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
        onLoad={handleImageLoad}
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
