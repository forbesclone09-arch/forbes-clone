import { useMemo, useState, useEffect, useRef } from "react";
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
  User,
  Users,
  MapPin,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Lock,
  Unlock,
  Search,
  Code,
  FileCode,
  Sparkles,
  Copy,
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
  const [userFullName, setUserFullName] = useState<string>("");
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"all_stories" | "my_stories" | "editor" | "profile" | "authors">("all_stories");
  const [storyTabMemory, setStoryTabMemory] = useState<"all_stories" | "my_stories">("all_stories");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticle, setActiveArticle] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
      } else {
        setSession(session);
        fetchData(session.user.id, session.user.email);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string, userEmail?: string) => {
    setLoading(true);
    const email = userEmail || session?.user?.email || "";
    const isSuperAdmin = email === "forbesclone09@gmail.com";

    // 1. Fetch profile to check role & approval status
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, is_approved, full_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (profileData?.full_name) {
      setUserFullName(profileData.full_name);
    } else if (session?.user?.user_metadata?.full_name) {
      setUserFullName(session.user.user_metadata.full_name);
    }

    // 2. Fetch role fallback
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    
    const userIsAdmin = isSuperAdmin || roleData?.role === "admin" || profileData?.role === "admin";
    const userRole = userIsAdmin ? "admin" : (profileData?.role || roleData?.role || "author");
    setRole(userRole);

    // Super admin or admin is always approved. Non-admin requires profileData.is_approved === true
    const approved = userIsAdmin ? true : (profileData?.is_approved ?? false);
    setIsApproved(approved);

    if (userIsAdmin) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);
      if (count !== null) setPendingCount(count);
    }

    if (!approved && !userIsAdmin) {
      setLoading(false);
      return;
    }

    // Fetch articles
    let query = supabase.from("articles").select("*").order("published_at", { ascending: false });
    const { data: articlesData, error: artError } = await query;
    if (artError) {
      const fallback = await supabase.from("articles").select("*");
      if (fallback.data) {
        setArticles(mapArticleRows(fallback.data));
      }
    } else if (articlesData) {
      setArticles(mapArticleRows(articlesData));
    }
    setLoading(false);
  };

  const mapArticleRows = (rows: any[]) => {
    return rows.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      deck: row.excerpt,
      category: row.category,
      author: { name: row.author, title: "Staff Writer" },
      author_id: row.author_id || null,
      author_email: row.author_email || null,
      published: new Date(row.published_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      published_at: row.published_at,
      readTime: parseInt(row.read_time) || 5,
      image: row.image_url,
      body: row.body,
      views: row.views || 0,
    }));
  };

  const isAdmin = useMemo(() => {
    return role === "admin" || session?.user?.email === "forbesclone09@gmail.com";
  }, [role, session]);

  const isStoryOwner = (article: any) => {
    if (!session?.user) return false;
    const userId = session.user.id;
    const userEmail = (session.user.email || "").trim().toLowerCase();
    const emailPrefix = userEmail.split("@")[0].toLowerCase();
    const fullName = (userFullName || "").trim().toLowerCase();

    // 1. Direct author_id match
    if (article.author_id && article.author_id === userId) return true;

    // 2. Direct author_email match
    if (article.author_email && article.author_email.trim().toLowerCase() === userEmail) return true;

    // 3. String name or email prefix match
    const rawAuthor = (
      typeof article.author === "string" 
        ? article.author 
        : article.author?.name || ""
    ).trim().toLowerCase();

    if (rawAuthor) {
      if (rawAuthor === userEmail) return true;
      if (rawAuthor === emailPrefix) return true;
      if (fullName && rawAuthor === fullName) return true;
    }

    return false;
  };

  const canEditStory = (article: any) => {
    return isAdmin || isStoryOwner(article);
  };

  const rows = useMemo(
    () =>
      articles.map((article, i) => ({
        article,
        status: (i < 2 ? "Published" : statuses[i % 3]) as Status,
        views: article.views,
        isOwner: isStoryOwner(article),
      })),
    [articles, session, userFullName],
  );

  const myRows = useMemo(
    () => rows.filter((r) => r.isOwner),
    [rows],
  );

  const activeRows = tab === "my_stories" ? myRows : rows;

  const visible = activeRows.filter((r) => {
    const matchesFilter = filter === "All" || r.status === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.article.title.toLowerCase().includes(q) ||
      r.article.category.toLowerCase().includes(q) ||
      (r.article.author?.name || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalViews = rows.reduce((s, r) => s + r.views, 0);
  const myTotalViews = myRows.reduce((s, r) => s + r.views, 0);
  const displayedStats = tab === "my_stories" ? myRows : rows;
  const displayedViews = tab === "my_stories" ? myTotalViews : totalViews;

  const openEditor = (article: any = null) => {
    if (article && !isAdmin && !isStoryOwner(article)) {
      alert("Permission denied: You can only edit stories that you authored.");
      return;
    }
    if (tab === "all_stories" || tab === "my_stories") {
      setStoryTabMemory(tab);
    }
    setActiveArticle(article);
    setTab("editor");
  };

  const handleEditorClose = () => {
    setTab(storyTabMemory || "all_stories");
    setActiveArticle(null);
    fetchData(session?.user?.id, session?.user?.email); // Refresh after edit
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  if (!isApproved && !isAdmin) {
    return (
      <PendingApprovalScreen
        session={session}
        onRefresh={() => fetchData(session.user.id, session.user.email)}
      />
    );
  }

  const dashboardTabs: [string, string, any, number?, string?][] = [
    ["all_stories", "All stories", Globe, rows.length, "neutral"],
    ["my_stories", "My stories", BookOpen, myRows.length, "neutral"],
    ["editor", "Editor", PenLine],
    ["profile", "Profile", User],
  ];
  if (isAdmin) {
    dashboardTabs.push(["authors", "Authors", Users, pendingCount, "warning"]); 
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-5">
        <div>
          <p className="kicker">Author dashboard {isAdmin && <span className="text-brand ml-2">(Admin Access)</span>}</p>
          <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem]">Welcome back, {userFullName || session?.user?.email}</h1>
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
          ["Published", displayedStats.filter((r) => r.status === "Published").length],
          ["In review", displayedStats.filter((r) => r.status === "In review").length],
          ["Drafts", displayedStats.filter((r) => r.status === "Draft").length],
          ["Total views", displayedViews.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="border-rule py-6 pr-4 odd:border-r lg:border-r lg:last:border-r-0 lg:px-6 lg:first:pl-0">
            <p className="kicker text-ink-soft">{tab === "my_stories" ? `My ${label}` : label}</p>
            <p className="mt-2 font-display text-[2rem] leading-none">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-6 border-b border-rule overflow-x-auto">
        {dashboardTabs.map(([key, label, Icon, badgeCount, badgeType]) => (
          <button
            key={key}
            onClick={() => {
              if (key === "all_stories" || key === "my_stories") {
                setTab(key as any);
                setStoryTabMemory(key as any);
              } else {
                setTab(key as any);
              }
            }}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-[0.88rem] font-semibold whitespace-nowrap transition-colors ${
              tab === key ? "border-brand text-foreground" : "border-transparent text-ink-soft hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {typeof badgeCount === "number" && (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold leading-none ${
                  badgeType === "warning" && badgeCount > 0
                    ? "bg-amber-500 text-white"
                    : "bg-secondary text-foreground border border-rule"
                }`}
              >
                {badgeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "all_stories" || tab === "my_stories" ? (
        <section className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="headline text-[1.4rem] text-foreground">
                {tab === "all_stories" ? "Newsroom Stories" : "My Uploaded Stories"}
              </h2>
              <p className="text-[0.82rem] text-ink-soft mt-0.5">
                {tab === "all_stories" ? (
                  isAdmin ? (
                    <span>All articles published across Forbes Germany. As an <strong className="text-foreground">Admin</strong>, you can edit any story.</span>
                  ) : (
                    <span>All articles across Forbes Germany. You can edit your own stories and view others.</span>
                  )
                ) : (
                  <span>Stories uploaded and published by your account ({myRows.length} total). You can edit any story in this list.</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-[0.8rem] border border-rule bg-background focus:border-foreground outline-none w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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

          {visible.length === 0 ? (
            tab === "my_stories" ? (
              <div className="py-16 text-center border border-dashed border-rule bg-secondary/15 my-6 p-8">
                <BookOpen className="h-10 w-10 text-ink-soft mx-auto mb-3" />
                <h3 className="font-display text-[1.3rem]">No personal stories found</h3>
                <p className="mt-2 text-[0.85rem] text-ink-soft max-w-md mx-auto">
                  {searchQuery || filter !== "All"
                    ? "No personal stories match your current filter criteria."
                    : "You haven't uploaded any stories yet. Start drafting your first article to publish on Forbes Germany."}
                </p>
                <button
                  onClick={() => openEditor()}
                  className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-[0.78rem] font-semibold tracking-wider text-background uppercase hover:bg-brand"
                >
                  <Plus className="h-4 w-4" /> Start Writing
                </button>
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-rule bg-secondary/15 my-6 p-8">
                <FileText className="h-10 w-10 text-ink-soft mx-auto mb-3" />
                <h3 className="font-display text-[1.3rem]">No stories match your search</h3>
                <p className="mt-2 text-[0.85rem] text-ink-soft max-w-md mx-auto">
                  Try clearing the search query or status filter to see all stories.
                </p>
              </div>
            )
          ) : (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {visible.map(({ article, status, views, isOwner }) => {
                const canEdit = isAdmin || isOwner;
                return (
                  <li key={article.slug} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <img src={article.image} alt="" className="h-16 w-24 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="kicker">{article.category}</p>
                        {isOwner && (
                          <span className="border border-blue-500/30 bg-blue-500/10 text-blue-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                            Your Story
                          </span>
                        )}
                      </div>
                      <Link
                        to="/article/$slug"
                        params={{ slug: article.slug }}
                        className="mt-1 block font-display text-[1.1rem] leading-snug hover:text-brand"
                      >
                        {article.title}
                      </Link>
                      <p className="mt-1 text-[0.8rem] text-ink-soft">
                        <span className="font-medium text-foreground">{article.author.name}</span> · {article.published} · {article.readTime} min read
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-[0.8rem]">
                      <span
                        className={`border px-2 py-1 font-semibold text-[0.75rem] ${
                          status === "Published" ? "border-foreground" : status === "In review" ? "border-brand text-brand" : "border-rule text-ink-soft"
                        }`}
                      >
                        {status}
                      </span>
                      <span className="inline-flex w-20 items-center gap-1 text-ink-soft">
                        <Eye className="h-3.5 w-3.5" /> {views ? views.toLocaleString() : "—"}
                      </span>
                      {canEdit ? (
                        <button
                          onClick={() => openEditor(article)}
                          className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-brand px-3 py-1 border border-rule hover:border-foreground transition-colors"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[0.75rem] text-ink-soft/70">
                            <Lock className="h-3 w-3" /> Read-only
                          </span>
                          <Link
                            to="/article/$slug"
                            params={{ slug: article.slug }}
                            className="text-[0.78rem] font-semibold text-ink-soft hover:text-foreground underline"
                          >
                            View
                          </Link>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : tab === "editor" ? (
        <Editor
          initialArticle={activeArticle}
          onClose={handleEditorClose}
          session={session}
          userFullName={userFullName}
          isAdmin={isAdmin}
          isOwner={isStoryOwner}
        />
      ) : tab === "profile" ? (
        <ProfileManager session={session} />
      ) : (
        <AuthorsManager session={session} onPendingChange={(c) => setPendingCount(c)} />
      )}
    </div>
  );
}

function PendingApprovalScreen({ session, onRefresh }: { session: any; onRefresh: () => void }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await onRefresh();
    setTimeout(() => setChecking(false), 500);
  };

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 py-16 sm:px-8">
      <div className="border border-rule bg-background p-8 sm:p-12 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-6">
          <Clock className="h-8 w-8" />
        </div>

        <p className="kicker text-amber-600">Contributor Verification</p>
        <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem] text-foreground">
          Account Pending Approval
        </h1>

        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft max-w-xl mx-auto">
          Thank you for joining <strong>{siteName}</strong>. Your author registration is currently awaiting review by our editorial administration. Once approved, you will have immediate access to draft, pitch, and publish stories.
        </p>

        <div className="mt-8 mx-auto max-w-md bg-secondary/40 border border-rule p-4 text-left space-y-2 text-[0.85rem]">
          <div className="flex justify-between">
            <span className="text-ink-soft">Registered Account:</span>
            <span className="font-semibold text-foreground">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Current Status:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Awaiting Admin Approval
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 bg-foreground px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking Status..." : "Check Status"}
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
            className="flex items-center gap-2 border border-rule px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileManager({ session }: { session: any }) {
  const [profile, setProfile] = useState({
    full_name: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    role: "author",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || session.user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          bio: data.bio || "",
          role: data.role || "author",
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
        }));
      }
      setLoading(false);
    }
    loadProfile();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      bio: profile.bio,
      role: profile.role,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      setMessage({ text: `Failed to save: ${error.message}`, type: "error" });
    } else {
      setMessage({ text: "Profile details updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3500);
    }
  };

  if (loading) return <div className="p-8 text-center text-ink-soft">Loading profile...</div>;

  return (
    <section className="mt-8 max-w-3xl">
      <div className="border-b border-rule pb-5">
        <h2 className="headline text-[1.8rem]">Author Profile</h2>
        <p className="mt-1 text-[0.9rem] text-ink-soft">
          Manage your personal details, public bio, and contact information.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Full Name
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="e.g. Alex Weber"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="mt-2 w-full border border-rule bg-secondary/30 px-3.5 py-2.5 text-[0.95rem] text-ink-soft outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="e.g. +49 151 23456789"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              City / Country
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="e.g. Berlin, Germany"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
            Street Address
          </label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="e.g. Friedrichstraße 45, 10117"
            className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
            Bio / Contributor Note
          </label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Write a short biography that appears on your published stories..."
            className="mt-2 w-full border border-rule bg-background p-3.5 text-[0.95rem] leading-relaxed outline-none focus:border-foreground"
          />
        </div>

        {message && (
          <div
            className={`p-3 text-[0.85rem] font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-foreground px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AuthorsManager({ session, onPendingChange }: { session: any; onPendingChange?: (count: number) => void }) {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [roleModalAuthor, setRoleModalAuthor] = useState<any>(null);
  const [roleModalSelectedRole, setRoleModalSelectedRole] = useState<string>("author");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [newAuthor, setNewAuthor] = useState({
    email: "",
    full_name: "",
    role: "author",
    phone: "",
    address: "",
    city: "",
    bio: "",
    is_approved: true,
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadAuthors = async () => {
    setLoading(true);
    // 1. Try querying profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Query user_roles as well to make sure we don't miss anyone
    const { data: rolesData } = await supabase.from("user_roles").select("*");

    let allAuthors: any[] = [];
    if (profilesData && profilesData.length > 0) {
      const profileUserIds = new Set(profilesData.map((p: any) => p.id));
      const extraAuthors = (rolesData || [])
        .filter((r: any) => !profileUserIds.has(r.user_id))
        .map((r: any) => ({
          id: r.user_id,
          email: r.user_id,
          full_name: "Author",
          role: r.role,
          is_approved: r.role === "admin" || r.user_id === session?.user?.id,
        }));
      allAuthors = [...profilesData, ...extraAuthors];
    } else if (rolesData) {
      allAuthors = rolesData.map((r: any) => ({
        id: r.user_id,
        email: r.user_id,
        full_name: "Author",
        role: r.role,
        is_approved: r.role === "admin" || r.user_id === session?.user?.id,
      }));
    }

    setAuthors(allAuthors);
    const unapprovedCount = allAuthors.filter(
      (a) => !a.is_approved && a.email !== "forbesclone09@gmail.com"
    ).length;
    if (onPendingChange) onPendingChange(unapprovedCount);
    setLoading(false);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleRoleChange = async (author: any, newRole: string) => {
    if (author.email === "forbesclone09@gmail.com" && newRole !== "admin") {
      alert("The primary super administrator account cannot be demoted.");
      return;
    }

    setUpdatingRoleId(author.id);
    setActionFeedback(null);

    try {
      const updatePayload: any = {
        role: newRole,
        updated_at: new Date().toISOString(),
      };
      if (newRole === "admin") {
        updatePayload.is_approved = true;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", author.id);

      if (profileError) throw profileError;

      // Sync user_roles table
      await supabase
        .from("user_roles")
        .upsert({
          user_id: author.id,
          role: newRole,
        });

      // Update state locally
      setAuthors((prev) =>
        prev.map((a) =>
          a.id === author.id
            ? { ...a, role: newRole, is_approved: newRole === "admin" ? true : a.is_approved }
            : a
        )
      );

      setActionFeedback({
        text: `Role for ${author.full_name || author.email} updated to ${newRole.toUpperCase()} successfully.`,
        type: "success",
      });
      setTimeout(() => setActionFeedback(null), 4000);
      setRoleModalAuthor(null);
    } catch (err: any) {
      setActionFeedback({
        text: `Failed to update role: ${err.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleApproveAuthor = async (author: any) => {
    setModalSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("id", author.id);

    setModalSaving(false);
    if (error) {
      alert(`Error approving author: ${error.message}`);
    } else {
      loadAuthors();
    }
  };

  const handleRevokeAuthor = async (author: any) => {
    if (
      !confirm(
        `Are you sure you want to suspend or revoke dashboard access for ${
          author.full_name || author.email
        }? They will no longer be able to access the author dashboard.`
      )
    ) {
      return;
    }
    setModalSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq("id", author.id);

    setModalSaving(false);
    if (error) {
      alert(`Error updating author: ${error.message}`);
    } else {
      loadAuthors();
    }
  };

  const handleSaveAuthorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
    setModalSaving(true);
    setErrorMsg("");

    const isAppr =
      editingAuthor.is_approved === true ||
      editingAuthor.is_approved === "true" ||
      editingAuthor.role === "admin" ||
      editingAuthor.email === "forbesclone09@gmail.com";

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: editingAuthor.id,
      email: editingAuthor.email,
      full_name: editingAuthor.full_name,
      role: editingAuthor.role,
      phone: editingAuthor.phone,
      address: editingAuthor.address,
      city: editingAuthor.city,
      bio: editingAuthor.bio,
      is_approved: isAppr,
      updated_at: new Date().toISOString(),
    });

    await supabase.from("user_roles").upsert({
      user_id: editingAuthor.id,
      role: editingAuthor.role,
    });

    setModalSaving(false);
    if (profileError) {
      setErrorMsg(profileError.message);
    } else {
      setEditingAuthor(null);
      loadAuthors();
    }
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSaving(true);
    setErrorMsg("");

    const newId = crypto.randomUUID();
    const { error: profileError } = await supabase.from("profiles").insert({
      id: newId,
      email: newAuthor.email,
      full_name: newAuthor.full_name,
      role: newAuthor.role,
      phone: newAuthor.phone,
      address: newAuthor.address,
      city: newAuthor.city,
      bio: newAuthor.bio,
      is_approved: true, // admin added authors are approved by default
    });

    if (!profileError) {
      await supabase.from("user_roles").upsert({
        user_id: newId,
        role: newAuthor.role,
      });
    }

    setModalSaving(false);
    if (profileError) {
      setErrorMsg(profileError.message);
    } else {
      setShowAddModal(false);
      setNewAuthor({
        email: "",
        full_name: "",
        role: "author",
        phone: "",
        address: "",
        city: "",
        bio: "",
        is_approved: true,
      });
      loadAuthors();
    }
  };

  const handleRemoveAuthor = async (author: any) => {
    if (!confirm(`Are you sure you want to remove author ${author.full_name || author.email}?`)) {
      return;
    }
    await supabase.from("profiles").delete().eq("id", author.id);
    await supabase.from("user_roles").update({ role: "user" }).eq("user_id", author.id);
    loadAuthors();
  };

  const pendingAuthors = authors.filter(
    (a) => !a.is_approved && a.email !== "forbesclone09@gmail.com"
  );
  const approvedAuthors = authors.filter(
    (a) => a.is_approved || a.email === "forbesclone09@gmail.com"
  );

  const filteredAuthors = authors.filter((a) => {
    if (statusFilter === "pending") return !a.is_approved && a.email !== "forbesclone09@gmail.com";
    if (statusFilter === "approved") return a.is_approved || a.email === "forbesclone09@gmail.com";
    return true;
  });

  if (loading) return <div className="mt-6 p-4 text-ink-soft">Loading authors...</div>;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="headline text-[1.8rem]">Manage Authors & Roles</h2>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Review author registrations, assign administrator permissions, approve dashboard access, and manage contributor profiles.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg("");
            setShowAddModal(true);
          }}
          className="bg-foreground text-background px-4 py-2.5 text-[0.8rem] font-semibold uppercase hover:bg-brand transition-colors"
        >
          + Add Author
        </button>
      </div>

      {actionFeedback && (
        <div
          className={`mb-6 p-3 text-[0.85rem] font-medium border flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs uppercase font-bold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {pendingAuthors.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/10 p-4 text-[0.88rem] text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingAuthors.length} author application(s)</strong> awaiting administrator approval.
            </span>
          </div>
          {statusFilter !== "pending" && (
            <button
              onClick={() => setStatusFilter("pending")}
              className="text-[0.78rem] font-bold uppercase tracking-wider text-amber-800 underline hover:text-amber-950"
            >
              Filter Pending Only &rarr;
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border transition-colors ${
            statusFilter === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          All ({authors.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border transition-colors ${
            statusFilter === "pending"
              ? "border-amber-600 bg-amber-600 text-white"
              : pendingAuthors.length > 0
              ? "border-amber-500/40 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Pending ({pendingAuthors.length})
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border transition-colors ${
            statusFilter === "approved"
              ? "border-foreground bg-foreground text-background"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          Approved ({approvedAuthors.length})
        </button>
      </div>

      <div className="border border-rule overflow-x-auto">
        <table className="w-full text-left text-[0.9rem] min-w-[760px]">
          <thead className="bg-secondary/50 border-b border-rule">
            <tr>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Author</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Role (Assign)</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Status</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Contact</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filteredAuthors.map((author) => {
              const isAppr = author.email === "forbesclone09@gmail.com" || author.is_approved;
              const isSuper = author.email === "forbesclone09@gmail.com";
              return (
                <tr key={author.id} className="hover:bg-secondary/20">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {author.full_name || "Author"}
                      {author.role === "admin" && (
                        <Shield className="h-3.5 w-3.5 text-brand" title="Administrator" />
                      )}
                    </div>
                    <div className="text-[0.8rem] text-ink-soft">{author.email}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={author.role || "author"}
                        disabled={updatingRoleId === author.id || isSuper}
                        onChange={(e) => handleRoleChange(author, e.target.value)}
                        className={`text-[0.74rem] font-bold uppercase tracking-wider border px-2 py-1 bg-background rounded-none cursor-pointer outline-none transition-colors ${
                          author.role === "admin"
                            ? "border-brand text-brand bg-brand/5 focus:border-brand font-extrabold"
                            : author.role === "author"
                            ? "border-foreground/30 text-foreground focus:border-foreground"
                            : "border-rule text-ink-soft focus:border-foreground"
                        } ${isSuper ? "cursor-not-allowed opacity-80" : ""}`}
                        title={isSuper ? "Primary administrator role cannot be altered" : "Assign new role to this user"}
                      >
                        <option value="admin">Admin</option>
                        <option value="author">Author</option>
                        <option value="contributor">Contributor</option>
                        <option value="user">User</option>
                      </select>
                      {updatingRoleId === author.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {isAppr ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-wider border border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                        <Check className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-wider border border-amber-500/40 text-amber-700 bg-amber-500/15">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-ink-soft text-[0.82rem]">
                    {author.phone && <div>{author.phone}</div>}
                    {author.city && <div className="text-[0.75rem] text-ink-soft/80">{author.city}</div>}
                    {!author.phone && !author.city && <span className="text-ink-soft/50">—</span>}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {!isSuper && !isAppr && (
                      <button
                        onClick={() => handleApproveAuthor(author)}
                        className="bg-emerald-600 text-white px-3 py-1 text-[0.75rem] font-semibold uppercase hover:bg-emerald-700 mr-3 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {!isSuper && isAppr && (
                      <button
                        onClick={() => handleRevokeAuthor(author)}
                        className="text-[0.75rem] font-semibold text-amber-700 hover:text-amber-900 hover:underline mr-3"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRoleModalAuthor({ ...author });
                        setRoleModalSelectedRole(author.role || "author");
                      }}
                      className="text-[0.8rem] font-semibold text-brand hover:underline mr-3"
                    >
                      Assign Role
                    </button>
                    <button
                      onClick={() => {
                        setErrorMsg("");
                        setEditingAuthor({ ...author });
                      }}
                      className="text-[0.8rem] font-semibold text-foreground hover:text-brand mr-3"
                    >
                      Edit Details
                    </button>
                    {author.role !== "admin" && !isSuper && (
                      <button
                        onClick={() => handleRemoveAuthor(author)}
                        className="text-[0.8rem] font-semibold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dedicated Assign Role Modal */}
      {roleModalAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-rule pb-3">
              <Shield className="h-5 w-5 text-brand" />
              <h3 className="font-display text-[1.4rem] text-foreground">
                Assign Role to {roleModalAuthor.full_name || roleModalAuthor.email}
              </h3>
            </div>
            <p className="mt-2 text-[0.85rem] text-ink-soft">
              Select a permission level below. Administrators can edit all stories, approve contributors, and assign roles to others.
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  id: "admin",
                  name: "Administrator",
                  badge: "Full Access",
                  desc: "Can edit all stories across newsroom, approve or suspend authors, assign roles, and manage site settings.",
                },
                {
                  id: "author",
                  name: "Author",
                  badge: "Standard Access",
                  desc: "Can write, draft, pitch, and publish stories. Can edit their own stories and customize their profile.",
                },
                {
                  id: "contributor",
                  name: "Contributor",
                  badge: "Guest Writer",
                  desc: "Can submit draft articles for review and manage their personal drafts.",
                },
                {
                  id: "user",
                  name: "Reader / User",
                  badge: "Subscriber",
                  desc: "Standard subscriber account. Does not have access to author dashboard or publication tools.",
                },
              ].map((r) => (
                <label
                  key={r.id}
                  onClick={() => setRoleModalSelectedRole(r.id)}
                  className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${
                    roleModalSelectedRole === r.id
                      ? "border-brand bg-brand/5"
                      : "border-rule bg-background hover:bg-secondary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="roleOption"
                    value={r.id}
                    checked={roleModalSelectedRole === r.id}
                    onChange={() => setRoleModalSelectedRole(r.id)}
                    className="mt-1 accent-brand"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[0.92rem]">{r.name}</span>
                      <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 border border-rule bg-secondary/50">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-[0.8rem] text-ink-soft mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setRoleModalAuthor(null)}
                className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingRoleId === roleModalAuthor.id}
                onClick={() => handleRoleChange(roleModalAuthor, roleModalSelectedRole)}
                className="bg-foreground px-5 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
              >
                {updatingRoleId === roleModalAuthor.id ? "Assigning..." : "Confirm Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-[1.4rem] text-foreground">Edit Author Details</h3>
            <p className="mt-1 text-[0.85rem] text-ink-soft">
              Update role, approval status, contact details, or profile information for {editingAuthor.email}.
            </p>

            <form onSubmit={handleSaveAuthorEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Full Name</label>
                <input
                  type="text"
                  value={editingAuthor.full_name || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, full_name: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Role (Assign)</label>
                <select
                  value={editingAuthor.role || "author"}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                >
                  <option value="admin">Admin (Full access to all stories & author management)</option>
                  <option value="author">Author (Standard story writing & personal editing)</option>
                  <option value="contributor">Contributor (Draft submissions)</option>
                  <option value="user">User (Reader account)</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Dashboard Access / Status</label>
                <select
                  value={editingAuthor.is_approved ? "true" : "false"}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, is_approved: e.target.value === "true" })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                >
                  <option value="true">Approved (Active Dashboard Access)</option>
                  <option value="false">Pending Approval (Restricted)</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={editingAuthor.phone || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={editingAuthor.city || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Address</label>
                <input
                  type="text"
                  value={editingAuthor.address || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, address: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Bio</label>
                <textarea
                  rows={3}
                  value={editingAuthor.bio || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background p-2.5 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setEditingAuthor(null)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
                >
                  {modalSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Author Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-[1.4rem] text-foreground">Add New Author</h3>
            <p className="mt-1 text-[0.85rem] text-ink-soft">
              Create an author profile in the system.
            </p>

            <form onSubmit={handleAddAuthor} className="mt-5 space-y-4">
              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Author Email*</label>
                <input
                  type="email"
                  required
                  value={newAuthor.email}
                  onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
                  placeholder="author@example.com"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Full Name*</label>
                <input
                  type="text"
                  required
                  value={newAuthor.full_name}
                  onChange={(e) => setNewAuthor({ ...newAuthor, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Role (Assign)</label>
                <select
                  value={newAuthor.role}
                  onChange={(e) => setNewAuthor({ ...newAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                >
                  <option value="author">Author (Standard author access)</option>
                  <option value="admin">Admin (Full administrative & editing access)</option>
                  <option value="contributor">Contributor (Guest author)</option>
                  <option value="user">User (Reader account)</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={newAuthor.phone}
                    onChange={(e) => setNewAuthor({ ...newAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={newAuthor.city}
                    onChange={(e) => setNewAuthor({ ...newAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
                >
                  {modalSaving ? "Adding..." : "Add Author"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
function Editor({ 
  initialArticle, 
  onClose, 
  session, 
  userFullName, 
  isAdmin, 
  isOwner 
}: { 
  initialArticle: any; 
  onClose: () => void; 
  session: any; 
  userFullName?: string; 
  isAdmin?: boolean; 
  isOwner?: (art: any) => boolean; 
}) {
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.deck || "");
  const [category, setCategory] = useState(initialArticle?.category || "Business");
  // Handle content body. Store as simple text for MVP, parse back into JSON array on save.
  const initialBodyText = initialArticle?.body 
    ? initialArticle.body.map((b: any) => b.content).join("\n\n") 
    : "";
  const [content, setContent] = useState(initialBodyText);
  const [saved, setSaved] = useState("");

  // Cover image states
  const [imageUrl, setImageUrl] = useState<string>(initialArticle?.image || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inline body image modal states
  const [showInlineImageModal, setShowInlineImageModal] = useState<boolean>(false);
  const [inlineImageUrl, setInlineImageUrl] = useState<string>("");
  const [inlineImageAlt, setInlineImageAlt] = useState<string>("");
  const [inlineUploading, setInlineUploading] = useState<boolean>(false);

  // Code / HTML view & Custom HTML snippet states
  const [editorMode, setEditorMode] = useState<"visual" | "code" | "preview">("visual");
  const [showInsertHtmlModal, setShowInsertHtmlModal] = useState<boolean>(false);
  const [customHtmlSnippet, setCustomHtmlSnippet] = useState<string>("");
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  // Permission Guard
  const hasEditPermission = !initialArticle || isAdmin || (isOwner && isOwner(initialArticle));
  if (!hasEditPermission) {
    return (
      <div className="my-12 p-8 border border-red-200 bg-red-50 text-center max-w-xl mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
        <h3 className="font-display text-[1.4rem] text-red-900">Access Restricted</h3>
        <p className="mt-2 text-[0.88rem] text-red-700 leading-relaxed">
          You do not have permission to edit this story because it was authored by another contributor. Only newsroom administrators or the original author can edit it.
        </p>
        <button
          onClick={onClose}
          className="mt-6 bg-foreground text-background px-5 py-2.5 text-[0.78rem] font-semibold uppercase hover:bg-brand"
        >
          Return to Stories
        </button>
      </div>
    );
  }

  // Core image upload helper (Supabase storage with Base64 fallback)
  const uploadImageFile = async (file: File): Promise<string> => {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file (JPEG, PNG, WebP, GIF).");
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `articles/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);
        return publicUrl;
      }
    } catch {
      // Fall through to Base64 data URL
    }

    // Fallback: Read as data URL so authors are never blocked even without bucket setup
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to process image file."));
      reader.readAsDataURL(file);
    });
  };

  const handleCoverFile = async (file: File) => {
    setIsUploading(true);
    setUploadError("");
    try {
      const url = await uploadImageFile(file);
      setImageUrl(url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleCoverFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setImageUrl(trimmed);
      setUrlInput("");
    }
  };

  // Text formatting insertion helper
  const insertFormatting = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selected = text.substring(start, end) || placeholder;
    const replacement = `${before}${selected}${after}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleFormatHtml = () => {
    if (!content.trim()) return;
    try {
      let formatted = "";
      let indentLevel = 0;
      const indentStr = "  ";
      const normalized = content
        .replace(/>\s+</g, "><")
        .replace(/\r\n/g, "\n")
        .trim();

      const tokens = normalized.split(/(<\/?[a-zA-Z0-9]+[^>]*>)/g).filter(Boolean);

      tokens.forEach((token) => {
        const isCloseTag = /^<\/[a-zA-Z0-9]+>/.test(token);
        const isOpenTag = /^<[a-zA-Z0-9]+[^>]*[^\/]>$/.test(token) && !/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i.test(token);
        const isInlineTag = /^<\/?(b|i|strong|em|a|span|code|small|sub|sup)[\s>]/i.test(token);

        if (isCloseTag && !isInlineTag) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        if (!isInlineTag && (isOpenTag || isCloseTag)) {
          formatted += (formatted ? "\n" : "") + indentStr.repeat(indentLevel) + token;
        } else {
          formatted += token;
        }

        if (isOpenTag && !isInlineTag) {
          indentLevel++;
        }
      });

      setContent(formatted || content);
    } catch {
      // Retain original if parsing edge case
    }
  };

  const handleLoadSampleHtml = () => {
    const sample = `<h2>The Rise of Sovereign Compute in Continental Europe</h2>
<p>Nations across the European Union are allocating tens of billions of euros toward localized AI infrastructure, aiming to reduce strategic dependence on external technology monopolies.</p>

<blockquote>
  "Digital sovereignty is not merely a commercial advantage—it is the foundational prerequisite of twenty-first century economic autonomy."
</blockquote>

<p>Industry analysts note three transformative pillars leading this historic pivot:</p>
<ul>
  <li><b>Domestic Data Clusters:</b> Tier-4 facilities constructed in Frankfurt and Paris.</li>
  <li><b>Hardware Independence:</b> Custom accelerator procurement partnerships.</li>
  <li><b>Regulatory Security:</b> Compliant open-weights foundation models.</li>
</ul>

<pre><code class="language-typescript">// Sovereign cluster allocation pipeline
export async function initializeComputeSovereignty(region: "eu-central") {
  return await dispatchClusterAllocation({ latency: "sub-5ms", localized: true });
}</code></pre>

<p>With major capital deployments continuing to accelerate through 2027, enterprise adoption is anticipated to exceed historical benchmarks by more than <b>35%</b>.</p>`;
    setContent(sample);
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleInsertCustomHtml = (snippetToInsert: string) => {
    const snippet = snippetToInsert.trim();
    if (!snippet) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = content;
      const newContent = text.substring(0, start) + "\n\n" + snippet + "\n\n" + text.substring(end);
      setContent(newContent);
    } else {
      setContent((prev) => (prev ? prev + "\n\n" + snippet : snippet));
    }
    setShowInsertHtmlModal(false);
    setCustomHtmlSnippet("");
  };

  const handleToolClick = (toolName: string) => {
    switch (toolName) {
      case "Bold":
        insertFormatting("<b>", "</b>", "bold text");
        break;
      case "Italic":
        insertFormatting("<i>", "</i>", "italic text");
        break;
      case "Heading2":
        insertFormatting("\n\n<h2>", "</h2>\n\n", "Subheading");
        break;
      case "Quote":
        insertFormatting("\n\n<blockquote>", "</blockquote>\n\n", "Notable quote text");
        break;
      case "List":
        insertFormatting("\n\n<ul>\n  <li>", "</li>\n  <li>Second item</li>\n</ul>\n\n", "First item");
        break;
      case "ListOrdered":
        insertFormatting("\n\n<ol>\n  <li>", "</li>\n  <li>Second step</li>\n</ol>\n\n", "Step one");
        break;
      case "Code":
        insertFormatting("<code>", "</code>", "code");
        break;
      case "CodeBlock":
        insertFormatting("\n\n<pre><code class=\"language-javascript\">\n", "\n</code></pre>\n\n", "// write code here");
        break;
      case "Link2": {
        const url = prompt("Enter hyperlink URL (e.g. https://...):");
        if (url) {
          insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>", "link text");
        }
        break;
      }
      case "ImagePlus":
        setShowInlineImageModal(true);
        break;
      case "InsertHtml":
        setShowInsertHtmlModal(true);
        break;
      default:
        break;
    }
  };

  const tools = [
    { name: "Bold", Icon: Bold, label: "Bold (<b>)" },
    { name: "Italic", Icon: Italic, label: "Italic (<i>)" },
    { name: "Heading2", Icon: Heading2, label: "Subheading (<h2>)" },
    { name: "Quote", Icon: Quote, label: "Quote block (<blockquote>)" },
    { name: "List", Icon: List, label: "Bulleted list (<ul>)" },
    { name: "ListOrdered", Icon: ListOrdered, label: "Numbered list (<ol>)" },
    { name: "Code", Icon: Code, label: "Inline code (<code>)" },
    { name: "CodeBlock", Icon: FileCode, label: "Code block (<pre>)" },
    { name: "Link2", Icon: Link2, label: "Insert link (<a>)" },
    { name: "ImagePlus", Icon: ImagePlus, label: "Insert image (<img>)" },
    { name: "InsertHtml", Icon: Code, label: "Insert custom HTML snippet" },
  ];

  const handleSave = async () => {
    setSaved("Saving...");
    const slug = initialArticle?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Parse paragraphs and HTML blocks intelligently
    const isHtmlContent = /<(p|div|h[1-6]|blockquote|pre|ul|ol|table|figure|section|article)[\s>]/i.test(content);
    let paragraphs: any[] = [];

    if (isHtmlContent) {
      if (content.includes("\n\n")) {
        paragraphs = content
          .split("\n\n")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => ({
            type: /<(div|h[1-6]|blockquote|pre|table|ul|ol|figure|iframe|section|article)/i.test(p) ? "html" : "paragraph",
            content: p,
          }));
      } else {
        paragraphs = [{ type: "html", content: content.trim() }];
      }
    } else {
      paragraphs = content
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => ({ type: "paragraph", content: p }));
    }
    
    const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const readTimeCalc = `${Math.max(1, Math.round(wordCount / 200))} min read`;

    const isNew = !initialArticle;
    const authorName = initialArticle
      ? (typeof initialArticle.author === "string" ? initialArticle.author : initialArticle.author?.name || "Staff Writer")
      : (userFullName || session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Staff Writer");

    const authorId = initialArticle?.author_id || (isNew ? session?.user?.id : null);
    const authorEmail = initialArticle?.author_email || (isNew ? session?.user?.email : null);

    const articleData: any = {
      slug,
      title,
      excerpt,
      category,
      body: paragraphs,
      image_url: imageUrl || initialArticle?.image || "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80",
      image_alt: title || "Article Image",
      author: authorName,
      read_time: readTimeCalc,
      published_at: initialArticle?.published_at || new Date().toISOString(),
      is_premium: false,
      author_id: authorId,
      author_email: authorEmail,
    };

    let { error } = await supabase.from('articles').upsert(articleData, { onConflict: 'slug' });
    if (error && (error.message.includes('author_id') || error.message.includes('author_email') || (error as any).code === '42703')) {
      const fallbackData = { ...articleData };
      delete fallbackData.author_id;
      delete fallbackData.author_email;
      const res = await supabase.from('articles').upsert(fallbackData, { onConflict: 'slug' });
      error = res.error;
    }
    
    if (error) {
      setSaved(`Error: ${error.message}`);
    } else {
      setSaved("Successfully saved to Supabase!");
      setTimeout(() => onClose(), 1500);
    }
  };

  const [categories, setCategories] = useState<string[]>(() => {
    const defaultCats = [...navCategories];
    if (initialArticle?.category && !defaultCats.includes(initialArticle.category)) {
      defaultCats.push(initialArticle.category);
    }
    return defaultCats;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  return (
    <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
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
        
        {/* Editor Mode Switcher & Code Actions Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between border border-b-0 border-rule bg-secondary/40 px-2 py-1.5">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                editorMode === "visual"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-ink-soft hover:bg-secondary hover:text-foreground"
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Visual Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                editorMode === "code"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-ink-soft hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              Code / HTML
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                editorMode === "preview"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-ink-soft hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 py-1">
            {editorMode === "code" && (
              <>
                <button
                  type="button"
                  onClick={handleFormatHtml}
                  title="Format and beautify HTML tags"
                  className="flex items-center gap-1 border border-rule bg-background px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft hover:border-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-brand" />
                  Format HTML
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleHtml}
                  title="Load sample rich article HTML template"
                  className="flex items-center gap-1 border border-rule bg-background px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft hover:border-foreground hover:text-foreground transition-colors"
                >
                  <FileCode className="h-3 w-3" />
                  Sample Template
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowInsertHtmlModal(true)}
              title="Insert custom HTML embed or component"
              className="flex items-center gap-1 border border-rule bg-background px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
              Insert HTML Snippet
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              title="Copy current content or HTML to clipboard"
              className="flex items-center gap-1 border border-rule bg-background px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft hover:border-foreground hover:text-foreground transition-colors"
            >
              {copiedHtml ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* View: Visual Editor */}
        {editorMode === "visual" && (
          <div>
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap border border-rule bg-secondary/20">
              {tools.map(({ name, Icon, label }) => (
                <button
                  key={name}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => handleToolClick(name)}
                  className="grid h-10 w-10 place-items-center border-r border-rule text-ink-soft hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Visual Text Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story... (separate paragraphs by pressing Enter twice) Supports HTML formatting, embeds, and images."
              className="min-h-[460px] w-full resize-y border border-t-0 border-rule bg-transparent p-5 font-serif text-[1.05rem] leading-relaxed outline-none focus:border-foreground"
            />
            <div className="flex items-center justify-between border border-t-0 border-rule bg-secondary/10 px-4 py-2 text-xs text-ink-soft">
              <span>{content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length} words • {content.length} characters</span>
              <span className="italic">Tip: Switch to <b>Code / HTML</b> to inspect or edit raw tags.</span>
            </div>
          </div>
        )}

        {/* View: Code / HTML View */}
        {editorMode === "code" && (
          <div>
            {/* Code Helper Bar */}
            <div className="flex flex-wrap items-center gap-1.5 border border-rule bg-[#1e1e24] px-3 py-2 text-xs">
              <span className="text-[0.7rem] uppercase tracking-wider text-gray-400 font-mono mr-2">Quick Tags:</span>
              {[
                { label: "<h2>", prefix: "<h2>", suffix: "</h2>", placeholder: "Section Heading" },
                { label: "<p>", prefix: "<p>", suffix: "</p>", placeholder: "Paragraph text" },
                { label: "<blockquote>", prefix: "<blockquote>\n  \"", suffix: "\"\n</blockquote>", placeholder: "Quote" },
                { label: "<code>", prefix: "<code>", suffix: "</code>", placeholder: "inline_code" },
                { label: "<pre>", prefix: "<pre><code class=\"language-typescript\">\n", suffix: "\n</code></pre>", placeholder: "// code block" },
                { label: "<ul>", prefix: "<ul>\n  <li>", suffix: "</li>\n  <li>Item 2</li>\n</ul>", placeholder: "Item 1" },
                { label: "<table>", prefix: "<table class=\"w-full\">\n  <thead>\n    <tr><th>Header 1</th><th>Header 2</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Value 1</td><td>Value 2</td></tr>\n  </tbody>\n</table>", suffix: "", placeholder: "" },
                { label: "<a>", prefix: "<a href=\"https://\" target=\"_blank\" rel=\"noopener noreferrer\">", suffix: "</a>", placeholder: "Link text" },
                { label: "<hr>", prefix: "<hr />\n", suffix: "", placeholder: "" },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => insertFormatting(tag.prefix, tag.suffix, tag.placeholder)}
                  className="rounded bg-[#2a2a32] px-2 py-1 font-mono text-[0.72rem] text-gray-200 hover:bg-brand hover:text-white transition-colors"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Dark Monospace Code Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              placeholder="<!-- Write or paste valid HTML markup here (e.g. <h2>, <p>, <blockquote>, <table>, <pre><code>, etc.) -->"
              className="min-h-[480px] w-full resize-y border border-t-0 border-rule bg-[#121217] p-5 font-mono text-[0.88rem] leading-relaxed text-[#f3f4f6] outline-none focus:border-brand selection:bg-brand/40"
            />

            <div className="flex flex-wrap items-center justify-between border border-t-0 border-rule bg-[#18181f] px-4 py-2 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  HTML / Raw Markup Active
                </span>
                <span>•</span>
                <span>{content.split("\n").length} lines</span>
                <span>•</span>
                <span>{content.length} characters</span>
              </div>
              <div className="text-[0.75rem] text-gray-400">
                All valid HTML tags, tables, and scripts are supported.
              </div>
            </div>
          </div>
        )}

        {/* View: Live Preview */}
        {editorMode === "preview" && (
          <div className="border border-rule bg-background">
            <div className="flex items-center justify-between border-b border-rule bg-secondary/30 px-4 py-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-ink-soft">
                Live Article Formatting Preview
              </span>
              <span className="text-[0.75rem] text-ink-soft">
                Rendered with Forbes Germany Typography & Styles
              </span>
            </div>
            <div className="p-8 min-h-[480px] max-h-[750px] overflow-y-auto">
              {content.trim() ? (
                <div
                  className="article-prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="py-24 text-center text-ink-soft">
                  <FileCode className="mx-auto h-10 w-10 opacity-30 mb-3" />
                  <p className="italic">No content entered yet.</p>
                  <p className="text-xs mt-1">Switch to <b>Visual Editor</b> or <b>Code / HTML</b> to create or paste your formatted content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="border-t-2 border-foreground pt-4">
          <p className="kicker">Publishing</p>
          <label className="mt-4 block text-[0.8rem] font-semibold">
            Category
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === "__NEW__") {
                  setShowCategoryModal(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              className="mt-2 w-full border border-rule bg-background px-3 py-2.5 font-normal outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__NEW__" className="font-semibold text-brand">
                + Create a new category...
              </option>
            </select>
          </label>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={handleSave}
              className="border border-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] uppercase hover:bg-secondary"
            >
              Save
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

        {/* Modal for creating a new category */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md border border-rule bg-background p-6 shadow-xl">
              <h3 className="font-display text-[1.4rem] text-foreground">Create New Category</h3>
              <p className="mt-1 text-[0.85rem] text-ink-soft">Enter the name of the new category you want to add.</p>
              <form onSubmit={handleCreateCategory} className="mt-4">
                <input
                  type="text"
                  autoFocus
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategoryName("");
                    }}
                    className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cover Image Section */}
        <div className="border-t border-rule pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="kicker">Cover image</p>
            <div className="flex text-[0.7rem] font-semibold uppercase">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-2 py-0.5 border border-r-0 ${uploadMode === "file" ? "bg-foreground text-background" : "border-rule text-ink-soft hover:bg-secondary"}`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`px-2 py-0.5 border ${uploadMode === "url" ? "bg-foreground text-background" : "border-rule text-ink-soft hover:bg-secondary"}`}
              >
                URL
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCoverFile(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          {imageUrl ? (
            <div className="relative group border border-rule overflow-hidden">
              <img
                src={imageUrl}
                alt="Cover Preview"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-3 py-1.5 text-xs font-semibold uppercase hover:bg-gray-100 transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="bg-red-600 text-white px-3 py-1.5 text-xs font-semibold uppercase hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : uploadMode === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-2 grid aspect-[4/3] cursor-pointer place-items-center border-2 border-dashed p-4 text-center transition-colors ${
                isDragging
                  ? "border-brand bg-brand/5"
                  : "border-rule text-ink-soft hover:border-foreground hover:bg-secondary/40"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-ink-soft">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                  <span className="text-xs font-medium">Uploading image...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-secondary rounded-full">
                    <UploadCloud className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-[0.7rem] text-ink-soft">
                    PNG, JPG, WebP, GIF up to 10MB
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full border border-rule bg-background px-3 py-2 text-[0.85rem] outline-none focus:border-foreground"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="w-full bg-foreground text-background py-1.5 text-xs font-semibold uppercase hover:bg-brand disabled:opacity-50"
              >
                Apply Image URL
              </button>
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-xs text-red-500">{uploadError}</p>
          )}
        </div>
      </aside>

      {/* Inline Image Modal */}
      {showInlineImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md border border-rule bg-background p-6 shadow-xl">
            <h3 className="font-display text-[1.3rem] text-foreground">Insert Image into Article</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">Upload an image file or paste an image link to embed in your text.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setInlineUploading(true);
                      try {
                        const url = await uploadImageFile(e.target.files[0]);
                        setInlineImageUrl(url);
                      } catch (err: any) {
                        alert(err.message);
                      } finally {
                        setInlineUploading(false);
                      }
                    }
                  }}
                  className="mt-1 w-full text-xs text-ink-soft file:mr-3 file:py-1.5 file:px-3 file:border file:border-rule file:text-xs file:font-semibold file:bg-secondary file:cursor-pointer hover:file:bg-foreground hover:file:text-background"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-rule"></div>
                <span className="flex-shrink mx-2 text-xs text-ink-soft uppercase font-semibold">Or Image URL</span>
                <div className="flex-grow border-t border-rule"></div>
              </div>

              <div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={inlineImageUrl}
                  onChange={(e) => setInlineImageUrl(e.target.value)}
                  className="w-full border border-rule bg-background px-3 py-2 text-[0.85rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Caption / Alt Text (Optional)</label>
                <input
                  type="text"
                  placeholder="Photo description or credit"
                  value={inlineImageAlt}
                  onChange={(e) => setInlineImageAlt(e.target.value)}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.85rem] outline-none focus:border-foreground"
                />
              </div>

              {inlineImageUrl && (
                <div className="border border-rule p-2 bg-secondary/30">
                  <img src={inlineImageUrl} alt="" className="max-h-36 mx-auto object-cover rounded" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineImageModal(false);
                    setInlineImageUrl("");
                    setInlineImageAlt("");
                  }}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!inlineImageUrl || inlineUploading}
                  onClick={() => {
                    const imgTag = `\n\n<figure class="my-6">\n  <img src="${inlineImageUrl}" alt="${inlineImageAlt}" class="w-full h-auto rounded" />\n  ${inlineImageAlt ? `<figcaption class="text-xs text-center text-gray-500 mt-2 italic">${inlineImageAlt}</figcaption>` : ''}\n</figure>\n\n`;
                    insertFormatting(imgTag, "", "");
                    setShowInlineImageModal(false);
                    setInlineImageUrl("");
                    setInlineImageAlt("");
                  }}
                  className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
                >
                  {inlineUploading ? "Uploading..." : "Insert Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Custom HTML Snippet Modal */}
      {showInsertHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl border border-rule bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="font-display text-[1.3rem] text-foreground">Insert Custom HTML Snippet</h3>
                <p className="mt-0.5 text-[0.82rem] text-ink-soft">
                  Paste raw HTML or choose from pre-formatted executive editorial components.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInsertHtmlModal(false);
                  setCustomHtmlSnippet("");
                }}
                className="text-ink-soft hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preset Selector Buttons */}
            <div className="mt-4">
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-ink-soft mb-2">
                Quick Preset Templates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCustomHtmlSnippet(
`<div style="background-color: rgba(200, 16, 46, 0.05); border-left: 4px solid #c8102e; padding: 1.25rem 1.5rem; margin: 2rem 0; border-radius: 2px;">
  <h4 style="margin: 0 0 0.5rem 0; color: #c8102e; font-weight: 700; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.06em;">Key Executive Insight</h4>
  <p style="margin: 0; font-size: 1rem; line-height: 1.6; color: inherit;">Enter your key strategic takeaway, market finding, or executive summary here.</p>
</div>`
                    )
                  }
                  className="border border-rule bg-secondary/30 px-3 py-2 text-left text-xs font-semibold hover:border-foreground hover:bg-secondary transition-colors"
                >
                  📌 Callout Box
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomHtmlSnippet(
`<table class="w-full">
  <thead>
    <tr>
      <th>Strategic Pillar</th>
      <th>2024 Actual</th>
      <th>2025 Target</th>
      <th>Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sovereign Cloud Deployments</td>
      <td>€12.4B</td>
      <td>€19.8B</td>
      <td>+59.6%</td>
    </tr>
    <tr>
      <td>Industrial Automation Nodes</td>
      <td>4,200</td>
      <td>7,850</td>
      <td>+86.9%</td>
    </tr>
    <tr>
      <td>Proprietary IP Filings</td>
      <td>312</td>
      <td>520</td>
      <td>+66.7%</td>
    </tr>
  </tbody>
</table>`
                    )
                  }
                  className="border border-rule bg-secondary/30 px-3 py-2 text-left text-xs font-semibold hover:border-foreground hover:bg-secondary transition-colors"
                >
                  📊 Data Table
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomHtmlSnippet(
`<pre><code class="language-typescript">// Enterprise compute cluster configuration
export interface ClusterSovereigntyConfig {
  region: "eu-central-1" | "eu-west-3";
  compliance: "GDPR" | "EU-AI-Act-High";
  latencyTargetMs: number;
}</code></pre>`
                    )
                  }
                  className="border border-rule bg-secondary/30 px-3 py-2 text-left text-xs font-semibold hover:border-foreground hover:bg-secondary transition-colors"
                >
                  💻 Code Block
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCustomHtmlSnippet(
`<blockquote class="my-6 border-l-4 border-foreground pl-4 italic text-lg leading-relaxed">
  "European digital sovereignty will ultimately be determined not by policy declarations, but by the physical compute and clean energy capacity built on the continent."
  <footer class="mt-2 text-xs not-italic font-sans uppercase tracking-wider text-ink-soft">
    — Managing Director, European Innovation Council
  </footer>
</blockquote>`
                    )
                  }
                  className="border border-rule bg-secondary/30 px-3 py-2 text-left text-xs font-semibold hover:border-foreground hover:bg-secondary transition-colors"
                >
                  💬 Pull Quote
                </button>
              </div>
            </div>

            {/* Custom HTML Textarea */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-ink-soft">
                  HTML Code / Embed Markup
                </label>
                <span className="text-[0.7rem] text-ink-soft">Supports divs, tables, iframes, styles, and tags</span>
              </div>
              <textarea
                value={customHtmlSnippet}
                onChange={(e) => setCustomHtmlSnippet(e.target.value)}
                placeholder="Paste or write your HTML snippet here..."
                rows={8}
                spellCheck={false}
                className="w-full border border-rule bg-[#141419] p-3 font-mono text-xs text-[#f3f4f6] outline-none focus:border-brand"
              />
            </div>

            {/* Live snippet preview */}
            {customHtmlSnippet.trim() && (
              <div className="mt-3 max-h-36 overflow-y-auto border border-rule bg-background p-3 text-xs">
                <div className="text-[0.68rem] uppercase tracking-wider text-ink-soft font-semibold mb-1">Preview:</div>
                <div
                  className="article-prose text-xs"
                  dangerouslySetInnerHTML={{ __html: customHtmlSnippet }}
                />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t border-rule pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowInsertHtmlModal(false);
                  setCustomHtmlSnippet("");
                }}
                className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customHtmlSnippet.trim()}
                onClick={() => handleInsertCustomHtml(customHtmlSnippet)}
                className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50 transition-colors"
              >
                Insert Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
