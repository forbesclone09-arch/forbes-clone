import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard, SectionHeading } from "@/components/article-card";
import { CategoryMosaic } from "@/components/category-mosaic";
import { FeaturedHero } from "@/components/featured-hero";
import { MostRead } from "@/components/most-read";
import { coverArticles as defaultCoverArticles, recentArticles, siteName, type Article, type CategoryName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `${siteName} — Business, Tech & Startups Coverage` },
      {
        name: "description",
        content: `Reporting and analysis on business, technology and the founders building what's next, from the ${siteName} newsroom.`,
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
  loader: async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    
    const activeData = (data || []).filter((row: any) => !row.deleted_at);
    
    if (error || activeData.length === 0) {
      return { articles: [] as Article[] };
    }

    const mappedArticles: Article[] = activeData.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      deck: row.excerpt,
      category: row.category as CategoryName,
      author: { name: row.author, title: "Staff Writer" },
      published: new Date(row.published_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      readTime: parseInt(row.read_time) || 5,
      image: row.image_url,
      aspect_ratio: row.aspect_ratio || (row.category === "Cover Feature" || row.is_cover ? "3:4" : undefined),
      is_cover: !!(row.is_cover || row.category === "Cover Feature"),
    }));

    return { articles: mappedArticles };
  },
  component: HomePage,
});

function HomePage() {
  const { articles } = Route.useLoaderData();
  const featured = articles[0];
  const dynamicRecent = articles.slice(1, 7);
  const displayRecent = dynamicRecent.length > 0
    ? [...dynamicRecent, ...recentArticles.filter((ra) => !dynamicRecent.some((dr) => dr.slug === ra.slug))].slice(0, 6)
    : recentArticles;

  const dbCoverArticles = articles.filter(
    (a) => a.is_cover || a.category === "Cover Feature" || a.aspect_ratio === "3:4"
  );
  const coverArticles = dbCoverArticles.length > 0 ? dbCoverArticles : defaultCoverArticles;

  return (
    <>
      <FeaturedHero article={featured} />

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
        {/* Magazine Cover Special Feature Section */}
        {coverArticles.length > 0 && (
          <section aria-label="Magazine Cover Feature" className="mt-10 sm:mt-14 border-t-2 border-foreground pt-8">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-rule pb-3">
              <div>
                <span className="kicker text-red-600 font-bold tracking-wider">Special Feature</span>
                <h2 className="headline mt-1 text-[1.75rem] text-foreground sm:text-[2.2rem]">
                  Forbes Magazine Covers
                </h2>
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
                3:4 Portrait Issue Editions
              </span>
            </div>
            
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {coverArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        <section aria-label="Recent news" className="mt-16">
          <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SectionHeading title="Recent News" kicker="Updated hourly" />
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                {displayRecent.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <MostRead articles={articles} />
            </div>
          </div>
        </section>

        <CategoryMosaic category="Business" articles={articles} />
        <CategoryMosaic category="Tech" articles={articles} />
      </div>
    </>
  );
}
