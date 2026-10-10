import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard, SectionHeading } from "@/components/article-card";
import { FeaturedHero } from "@/components/featured-hero";
import { siteName, Article, CategoryName } from "@/data/content";
import { supabase } from "@/lib/supabase";

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
  loader: async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (error || !data) return { articles: [] as Article[] };

    const mappedArticles: Article[] = data.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      deck: row.excerpt,
      category: row.category as CategoryName,
      author: { name: row.author, title: "Staff Writer" },
      published: new Date(row.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      readTime: parseInt(row.read_time) || 5,
      image: row.image_url,
    }));

    return { articles: mappedArticles };
  },
  component: HomePage,
});

function HomePage() {
  const { articles } = Route.useLoaderData();
  const featured = articles[0];
  const recent = articles.slice(1);

  return (
    <>
      {featured && <FeaturedHero article={featured} />}

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
        <section aria-label="Recent news" className="mt-16">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <SectionHeading title="Recent News" kicker="Live from Supabase" />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
              {recent.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
