import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { allArticles, navCategories } from "@/data/content";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

const BASE_URL = "https://premium-publish-pro.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const articleRoute = router.routesById["/article/$slug"];
        if (isSitemapRouteIncluded(articleRoute)) {
          for (const article of allArticles) {
            const location = router.buildLocation({
              to: "/article/$slug",
              params: { slug: article.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, "/article/$slug");
            if (path) entries.push({ path });
          }
        }

        const categoryRoute = router.routesById["/category/$category"];
        if (isSitemapRouteIncluded(categoryRoute)) {
          for (const category of navCategories) {
            const location = router.buildLocation({
              to: "/category/$category",
              params: { category: category.toLowerCase() },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, "/category/$category");
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) {
          return new Response(
            'No pages are included in this sitemap. Check route decisions and ancestor exclusions. Setting "exclude-subtree" on the root excludes the entire site.',
            { status: 404, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
