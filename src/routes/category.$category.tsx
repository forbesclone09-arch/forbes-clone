import { createFileRoute, notFound } from "@tanstack/react-router";

import { ArticleCard, SectionHeading } from "@/components/article-card";
import { articlesByCategory, navCategories, siteName, type CategoryName } from "@/data/content";

export const Route = createFileRoute("/category/$category")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const match = navCategories.find(
      (category) => category.toLowerCase() === params.category.toLowerCase(),
    );
    if (!match) throw notFound();
    return { category: match as CategoryName, articles: articlesByCategory(match) };
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
