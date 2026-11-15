import { createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleCard, SectionHeading } from "@/components/article-card";
import { articlesByCategory, navCategories, siteName, type CategoryName, type Article } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/category/$category")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    const rawParam = decodeURIComponent(params.category).toLowerCase().trim();
    const match = navCategories.find(
      (category) =>
        category.toLowerCase() === rawParam ||
        category.toLowerCase().replace(/\s+/g, "-") === rawParam,
    );
    if (!match) throw notFound();

    const { data: rows } = await supabase
      .from("articles")
      .select("*")
      .ilike("category", match)
      .order("created_at", { ascending: false });

    const activeRows = (rows || []).filter((row: any) => !row.deleted_at);

    const dbArticles: Article[] = activeRows.map((row: any) => ({
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

    const articles = dbArticles.length > 0 ? dbArticles : articlesByCategory(match);

    return { category: match as CategoryName, articles };
  },
  head: ({ loaderData }) => {
    const category = loaderData?.category ?? "Category";
    return {
      meta: [
        { title: `${category} — ${siteName}` },
        {
          name: "description",
          content: `Reporting and analysis from the ${category} desk at ${siteName}.`,
        },
        { property: "og:title", content: `${category} — ${siteName}` },
        {
          property: "og:description",
          content: `Reporting and analysis from the ${category} desk at ${siteName}.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, articles } = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 pt-10 sm:px-8">
      <SectionHeading title={category} kicker={`${articles.length} stories`} />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
