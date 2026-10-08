import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard, SectionHeading } from "@/components/article-card";
import { CategoryMosaic } from "@/components/category-mosaic";
import { FeaturedHero } from "@/components/featured-hero";
import { MostRead } from "@/components/most-read";
import { recentArticles, siteName } from "@/data/content";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `${siteName} — Business, Tech & Startups Coverage` },
      {
        name: "description",
        content:
          "Reporting and analysis on business, technology and the founders building what's next, from the Meridian newsroom.",
      },
      { property: "og:title", content: `${siteName} — Business, Tech & Startups Coverage` },
      {
        property: "og:description",
        content:
          "Reporting and analysis on business, technology and the founders building what's next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <FeaturedHero />

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
        <section aria-label="Recent news" className="mt-16">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading title="Recent News" kicker="Updated hourly" />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {recentArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <MostRead />
          </div>
        </div>
      </section>
        <CategoryMosaic category="Business" />
        <CategoryMosaic category="Tech" />
      </div>
    </>
  );
}
