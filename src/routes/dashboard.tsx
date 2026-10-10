import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

import { navCategories, siteName, type CategoryName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Author dashboard — ${siteName}` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Manage your stories, drafts and readership in one place." },
    ],
  }),
  component: DashboardPage,
});

type Status = "Published" | "In review" | "Draft";
const statuses: Status[] = ["Published", "In review", "Draft"];

function DashboardPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>("user");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
      } else {
        setSession(session);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    // Fetch role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    const userRole = roleData?.role || "user";
    setRole(userRole);

    // Fetch articles
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
    
    // If not admin, maybe restrict to their own (for now, we'll just show all since auth isn't fully linking articles to authors yet)
    const { data: articlesData } = await query;
    if (articlesData) {
      const mapped = articlesData.map((row: any) => ({
        slug: row.slug,
        title: row.title,
        deck: row.excerpt,
        category: row.category,
        author: { name: row.author, title: "Staff Writer" },
        published: new Date(row.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        readTime: parseInt(row.read_time) || 5,
        image: row.image_url,
        body: row.body,
        views: row.views || 0,
      }));
      setArticles(mapped);
    }
    setLoading(false);
  };

  const rows = useMemo(
    () =>
      articles.map((article, i) => ({
        article,
        status: (i < 2 ? "Published" : statuses[i % 3]) as Status,
        views: article.views,
      })),
    [articles],
  );
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [tab, setTab] = useState<"stories" | "editor" | "authors">("stories");
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const visible = rows.filter((r) => filter === "All" || r.status === filter);
  const totalViews = rows.reduce((s, r) => s + r.views, 0);

  const openEditor = (article: any = null) => {
    setActiveArticle(article);
    setTab("editor");
  };

  const handleEditorClose = () => {
    setTab("stories");
    setActiveArticle(null);
    fetchData(session?.user?.id); // Refresh after edit
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  const dashboardTabs: any[] = [
    ["stories", "My stories", FileText],
    ["editor", "Editor", PenLine],
  ];
  if (role === "admin") {
    // We import Users icon down below or we can just use another icon, wait we didn't import Users
    dashboardTabs.push(["authors", "Authors", List]); 
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-5">
        <div>
          <p className="kicker">Author dashboard {role === 'admin' && <span className="text-brand ml-2">(Admin Access)</span>}</p>
          <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem]">Welcome back, {session?.user?.email}</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
            className="text-[0.78rem] font-semibold tracking-[0.08em] text-ink-soft hover:text-foreground uppercase"
          >
            Sign out
          </button>
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[0.78rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
          >
            <Plus className="h-4 w-4" /> New story
          </button>
        </div>
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
        {dashboardTabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => key === "stories" ? handleEditorClose() : setTab(key)}
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
                  <button onClick={() => openEditor(article)} className="font-semibold hover:text-brand">
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : tab === "editor" ? (
        <Editor initialArticle={activeArticle} onClose={handleEditorClose} session={session} />
      ) : (
        <AuthorsManager />
      )}
    </div>
  );
}

function AuthorsManager() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('user_roles').select('*').then(({ data }) => {
      setAuthors(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="mt-6 p-4">Loading authors...</div>;

  return (
    <section className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="headline text-[1.8rem]">Manage Authors</h2>
        <button className="bg-foreground text-background px-4 py-2 text-[0.8rem] font-semibold uppercase hover:bg-brand">
          + Add Author
        </button>
      </div>
      <div className="border border-rule">
        <table className="w-full text-left text-[0.9rem]">
          <thead className="bg-secondary/50 border-b border-rule">
            <tr>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Role</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">ID</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-secondary/20">
                <td className="py-4 px-4 font-semibold text-foreground uppercase">{author.role}</td>
                <td className="py-4 px-4 text-ink-soft">{author.user_id}</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-[0.8rem] font-semibold hover:text-brand mr-4 text-ink-soft">Edit Details</button>
                  <button className="text-[0.8rem] font-semibold text-red-500 hover:text-red-700">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[0.8rem] text-ink-soft">
        Note: Supabase requires Admin API access or server-side edge functions to securely reset user passwords or delete authentication accounts.
      </p>
    </section>
  );
}

function Editor({ initialArticle, onClose, session }: { initialArticle: any, onClose: () => void, session: any }) {
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.deck || "");
  const [category, setCategory] = useState(initialArticle?.category || "Business");
  // Handle content body. Store as simple text for MVP, parse back into JSON array on save.
  const initialBodyText = initialArticle?.body 
    ? initialArticle.body.map((b: any) => b.content).join("\n\n") 
    : "";
  const [content, setContent] = useState(initialBodyText);
  const [saved, setSaved] = useState("");
  const tools = [Bold, Italic, Heading2, Quote, List, ListOrdered, Link2, ImagePlus];

  const handleSave = async () => {
    setSaved("Saving...");
    const slug = initialArticle?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const paragraphs = content.split("\n\n").map(p => ({ type: "paragraph", content: p }));
    
    const articleData = {
      slug,
      title,
      excerpt,
      category,
      body: paragraphs,
      image_url: initialArticle?.image || "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80",
      image_alt: "Article Image",
      author: session?.user?.email?.split('@')[0] || "Unknown",
      read_time: "5 min read",
      published_at: initialArticle?.published_at || new Date().toISOString(),
      is_premium: false
    };

    const { error } = await supabase.from('articles').upsert(articleData, { onConflict: 'slug' });
    
    if (error) {
      setSaved(`Error: ${error.message}`);
    } else {
      setSaved("Successfully saved to Supabase!");
      setTimeout(() => onClose(), 1500);
    }
  };

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
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your story... (separate paragraphs by pressing Enter twice) Supports HTML."
          className="min-h-[360px] w-full resize-y border border-t-0 border-rule bg-transparent p-5 text-[1.02rem] leading-relaxed outline-none focus:border-foreground"
        />
      </div>

      <aside className="space-y-6">
        <div className="border-t-2 border-foreground pt-4">
          <p className="kicker">Publishing</p>
          <label className="mt-4 block text-[0.8rem] font-semibold">
            Category
            <input
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full border border-rule bg-background px-3 py-2.5 font-normal outline-none"
              placeholder="Select or type..."
            />
            <datalist id="categories-list">
              {navCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={handleSave}
              className="border border-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] uppercase hover:bg-secondary"
            >
              Save to DB
            </button>
            <button
              onClick={() => onClose()}
              className="bg-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] text-background uppercase hover:bg-brand"
            >
              Cancel
            </button>
          </div>
          {saved && <p className={`mt-3 border-l-2 pl-3 text-[0.8rem] ${saved.includes('Error') ? 'border-red-500 text-red-500' : 'border-brand text-brand'}`}>{saved}</p>}
        </div>
        <div className="border-t border-rule pt-4">
          <p className="kicker">Cover image</p>
          <div className="mt-3 grid aspect-[4/3] place-items-center border border-dashed border-rule text-[0.8rem] text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" /> Drop an image
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
