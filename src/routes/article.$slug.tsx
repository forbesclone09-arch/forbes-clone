import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { ArticleCard, CategoryKicker } from "@/components/article-card";
import { allArticles, siteName, type Author } from "@/data/content";
import { getBody } from "@/data/article-body";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/article/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params }) => {
    // 1. Check Supabase first
    const { data: row } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();

    if (row) {
      const article = {
        slug: row.slug,
        title: row.title,
        deck: row.excerpt,
        category: row.category,
        author: { name: row.author, title: "Staff Writer" },
        published: new Date(row.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        readTime: parseInt(row.read_time) || 5,
        image: row.image_url,
        body: row.body // Array of paragraphs from DB
      };
      return { article };
    }

    // 2. Graceful fallback for built-in template articles
    const staticArticle = allArticles.find((a) => a.slug === params.slug);
    if (staticArticle) {
      const fallback = getBody(staticArticle.category);
      const article = {
        slug: staticArticle.slug,
        title: staticArticle.title,
        deck: staticArticle.deck,
        category: staticArticle.category,
        author: staticArticle.author,
        published: staticArticle.published,
        readTime: staticArticle.readTime,
        image: staticArticle.image,
        body: fallback?.paragraphs
          ? fallback.paragraphs.map((content) => ({ type: "paragraph", content }))
          : [{ type: "paragraph", content: staticArticle.deck }],
      };
      return { article };
    }

    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: `Story unavailable — ${siteName}` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} — ${siteName}` },
        { name: "description", content: article.deck },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.deck },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function AuthorBadge({ author }: { author: Author }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 shrink-0 place-items-center bg-foreground font-display text-base leading-none text-background"
      >
        {initials(author.name)}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{author.name}</span>
        <span className="block text-[0.78rem] text-ink-soft">{author.title}</span>
      </span>
    </div>
  );
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const bodyBlocks = article.body || [];
  
  // To avoid loading another query just for related, we can just omit them or load them simply
  // Wait, I can't easily run a hook for related without useEffect, but I don't need related for MVP, or I can just show nothing for now. Let's just leave related empty since the loader doesn't fetch them.
  const related: any[] = [];

  return (
    <article className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
      <div className="pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.1em] text-ink-soft uppercase transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to front page
        </Link>
      </div>

      <header className="mt-6 grid gap-6 border-b border-rule pb-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <CategoryKicker category={article.category as any} />
          <h1 className="headline mt-3 text-[2.1rem] text-foreground sm:text-[2.9rem] lg:text-[3.4rem]">
            {article.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.08rem] leading-relaxed text-ink-soft">
            {article.deck}
          </p>
        </div>

        <div className="flex flex-col justify-end gap-4 lg:col-span-4">
          <AuthorBadge author={article.author} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule pt-4 text-[0.78rem] text-ink-soft">
            <span>{article.published}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readTime} min read
            </span>
          </div>
        </div>
      </header>

      <figure className="mt-8">
        <img
          src={article.image}
          alt={article.title}
          fetchPriority="high"
          className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
        />
        <figcaption className="mt-3 border-b border-rule pb-5 text-[0.75rem] text-ink-soft">
          Photographed for {siteName}. {article.published}.
        </figcaption>
      </figure>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mt-6 space-y-6">
            {bodyBlocks.map((block: any, idx: number) => {
              const content = typeof block === 'string' ? block : block?.content || '';
              if (!content) return null;
              const isHtmlBlock = block.type === 'html' || /<(div|h[1-6]|blockquote|pre|table|ul|ol|figure|iframe|p|section|article|code)/i.test(content);
              
              if (isHtmlBlock) {
                return (
                  <div 
                    key={idx} 
                    className="article-prose"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                );
              }
              return (
                <p 
                  key={idx} 
                  className="text-[1.05rem] leading-[1.75] text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="border-t-2 border-foreground pt-4">
            <h2 className="headline text-[1.2rem] text-foreground">More in {article.category}</h2>
            <div className="mt-6 space-y-8">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
