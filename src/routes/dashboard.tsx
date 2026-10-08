import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bold,
  Eye,
  FileText,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  PenLine,
  Plus,
  Quote,
} from "lucide-react";

import { allArticles, navCategories, siteName, type CategoryName } from "@/data/content";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Author dashboard — ${siteName}` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Manage your stories, drafts and readership in one place." },
      { property: "og:title", content: `Author dashboard — ${siteName}` },
      {
        property: "og:description",
        content: "Manage your stories, drafts and readership in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

type Status = "Published" | "In review" | "Draft";
const statuses: Status[] = ["Published", "In review", "Draft"];
const viewCounts = [48210, 31904, 22785, 18320, 15102, 9870, 7340, 5120, 2980, 1410, 860];

function DashboardPage() {
  const rows = useMemo(
    () =>
      allArticles.map((article, i) => ({
        article,
        status: (i < 7 ? "Published" : statuses[i % 3]) as Status,
        views: i < 7 ? (viewCounts[i] ?? 0) : 0,
      })),
    [],
  );
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [tab, setTab] = useState<"stories" | "editor">("stories");
  const visible = rows.filter((r) => filter === "All" || r.status === filter);
  const totalViews = rows.reduce((s, r) => s + r.views, 0);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-5">
        <div>
          <p className="kicker">Author dashboard</p>
          <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem]">Good morning, Nadia</h1>
        </div>
        <button
          onClick={() => setTab("editor")}
          className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[0.78rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
        >
          <Plus className="h-4 w-4" /> New story
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-rule lg:grid-cols-4">
        {[
          ["Published", rows.filter((r) => r.status === "Published").length],
          ["In review", rows.filter((r) => r.status === "In review").length],
          ["Drafts", rows.filter((r) => r.status === "Draft").length],
          ["Total views", totalViews.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="border-rule py-6 pr-4 odd:border-r lg:border-r lg:last:border-r-0 lg:px-6 lg:first:pl-0">
            <p className="kicker text-ink-soft">{label}</p>
            <p className="mt-2 font-display text-[2rem] leading-none">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-6 border-b border-rule">
        {(
          [
            ["stories", "My stories", FileText],
            ["editor", "Editor", PenLine],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-[0.88rem] font-semibold transition-colors ${
              tab === key ? "border-brand text-foreground" : "border-transparent text-ink-soft hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "stories" ? (
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {(["All", ...statuses] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`border px-3 py-1.5 text-[0.78rem] font-semibold transition-colors ${
                  filter === s ? "border-foreground bg-foreground text-background" : "border-rule text-ink-soft hover:border-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {visible.map(({ article, status, views }) => (
              <li key={article.slug} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <img src={article.image} alt="" className="h-16 w-24 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="kicker">{article.category}</p>
                  <Link
                    to="/article/$slug"
                    params={{ slug: article.slug }}
                    className="mt-1 block font-display text-[1.1rem] leading-snug hover:text-brand"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-[0.8rem] text-ink-soft">
                    {article.author.name} · {article.published} · {article.readTime} min read
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[0.8rem]">
                  <span
                    className={`border px-2 py-1 font-semibold ${
                      status === "Published" ? "border-foreground" : status === "In review" ? "border-brand text-brand" : "border-rule text-ink-soft"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="inline-flex w-20 items-center gap-1 text-ink-soft">
                    <Eye className="h-3.5 w-3.5" /> {views ? views.toLocaleString() : "—"}
                  </span>
                  <button onClick={() => setTab("editor")} className="font-semibold hover:text-brand">
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <Editor />
      )}
    </div>
  );
}

function Editor() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryName>("Business");
  const [saved, setSaved] = useState("");
  const tools = [Bold, Italic, Heading2, Quote, List, ListOrdered, Link2, ImagePlus];

  return (
    <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          className="w-full border-b border-rule bg-transparent pb-3 font-display text-[2rem] leading-tight outline-none placeholder:text-ink-soft focus:border-foreground"
        />
        <input
          placeholder="Standfirst — one or two sentences that sell the story"
          className="mt-4 w-full bg-transparent text-[1.05rem] text-ink-soft outline-none"
        />
        <div className="mt-6 flex flex-wrap border border-rule">
          {tools.map((Icon, i) => (
            <button
              key={i}
              type="button"
              aria-label="Formatting tool"
              className="grid h-10 w-10 place-items-center border-r border-rule text-ink-soft hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div
          contentEditable
          suppressContentEditableWarning
          className="min-h-[360px] border border-t-0 border-rule p-5 text-[1.02rem] leading-relaxed outline-none focus:border-foreground"
        >
          Start writing your story…
        </div>
      </div>

      <aside className="space-y-6">
        <div className="border-t-2 border-foreground pt-4">
          <p className="kicker">Publishing</p>
          <label className="mt-4 block text-[0.8rem] font-semibold">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryName)}
              className="mt-2 w-full border border-rule bg-background px-3 py-2.5 font-normal outline-none"
            >
              {navCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSaved("Draft saved locally (demo only).")}
              className="border border-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] uppercase hover:bg-secondary"
            >
              Save draft
            </button>
            <button
              onClick={() => setSaved("Sent to editors for review (demo only).")}
              className="bg-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] text-background uppercase hover:bg-brand"
            >
              Submit
            </button>
          </div>
          {saved && <p className="mt-3 border-l-2 border-brand pl-3 text-[0.8rem] text-ink-soft">{saved}</p>}
        </div>
        <div className="border-t border-rule pt-4">
          <p className="kicker">Cover image</p>
          <div className="mt-3 grid aspect-[4/3] place-items-center border border-dashed border-rule text-[0.8rem] text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" /> Drop an image
            </span>
          </div>
        </div>
        <div className="border-t border-rule pt-4 text-[0.82rem] leading-relaxed text-ink-soft">
          <p className="kicker text-foreground">Desk guidelines</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-4">
            <li>Headlines under 90 characters.</li>
            <li>Attribute every figure to a source.</li>
            <li>Captions credit the photographer.</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
