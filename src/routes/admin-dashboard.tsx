import { useMemo, useState, useEffect, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  ExternalLink,
  Search,
  Plus,
  PenLine,
  User,
  Edit2,
  Trash2,
  Globe,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";

import { navCategories, siteName } from "@/data/content";
import { supabase } from "@/lib/supabase";
import {
  type Status,
  statuses,
  mapArticleRows,
  isStoryOwner,
  getUserRoleAndApproval,
  type ArticleRow,
} from "@/components/dashboard/shared";
import { AuthorsManager } from "@/components/dashboard/AuthorsManager";
import { ProfileManager } from "@/components/dashboard/ProfileManager";
import { Editor } from "@/components/dashboard/Editor";

export const Route = createFileRoute("/admin-dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Executive Admin Dashboard — ${siteName}` },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Manage newsroom publications, editorial approvals, and team roles." },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-[#090a0f] p-6 text-zinc-100">
      <div className="max-w-md rounded-lg border border-red-900/60 bg-zinc-900 p-6 text-center shadow-xl">
        <h2 className="text-xl font-bold text-red-500 mb-2">Executive Newsroom Notice</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Something went wrong while displaying the administrative dashboard.
        </p>
        {error?.message && (
          <pre className="mb-4 max-h-36 overflow-x-auto rounded bg-black/70 p-3 text-left font-mono text-xs text-red-300 whitespace-pre-wrap">
            {error.message}
          </pre>
        )}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors"
          >
            Reload Newsroom
          </button>
          <a
            href="/"
            className="rounded border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Public Site
          </a>
        </div>
      </div>
    </div>
  ),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [userFullName, setUserFullName] = useState<string>("");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [totalAuthorsCount, setTotalAuthorsCount] = useState<number>(0);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"all_stories" | "editor" | "profile" | "authors">("all_stories");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
        setIsMobileNavOpen(false);
      }
    };
    if (isMobileNavOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (!session) {
        navigate({ to: "/private-admin-login" });
        return;
      }
      try {
        const { isAdmin, fullName } = await getUserRoleAndApproval(session.user.id, session.user.email);
        if (!isMounted) return;
        if (!isAdmin) {
          navigate({ to: "/author-dashboard" });
          return;
        }
        setSession(session);
        if (fullName) setUserFullName(fullName);
        await fetchData();
      } catch (err) {
        console.error("Admin dashboard init error:", err);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch pending authors count
    const { count: pending } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false);
    if (pending !== null) setPendingCount(pending);

    // Fetch total authors count
    const { count: totalAuthors } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    if (totalAuthors !== null) setTotalAuthorsCount(totalAuthors);

    // Fetch all articles
    const { data: articlesData, error: artError } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });

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

  const rows = useMemo(
    () =>
      articles.map((article, i) => ({
        article,
        status: (i < 2 ? "Published" : statuses[i % 3]) as Status,
        isOwner: isStoryOwner(article, session, userFullName),
      })),
    [articles, session, userFullName],
  );

  const visible = rows.filter((r) => {
    const matchesFilter = filter === "All" || r.status === filter;
    const cat = (r.article.category || "").toLowerCase();
    const matchesCat = categoryFilter === "All" || cat === categoryFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesFilter && matchesCat;

    const titleStr = (r.article.title || "").toLowerCase();
    const deckStr = (r.article.deck || "").toLowerCase();
    const authorStr = (
      typeof r.article.author === "string"
        ? r.article.author
        : r.article.author?.name || ""
    ).toLowerCase();

    const matchesSearch =
      titleStr.includes(q) ||
      deckStr.includes(q) ||
      authorStr.includes(q);

    return matchesFilter && matchesCat && matchesSearch;
  });

  const openEditor = (article: any = null) => {
    setActiveArticle(article);
    setTab("editor");
  };

  const handleEditorClose = () => {
    setTab("all_stories");
    setActiveArticle(null);
    fetchData();
  };

  const handleDeleteArticle = async (article: any) => {
    const confirmed = window.confirm(
      `Executive Action: Are you sure you want to permanently delete "${article.title}"?\n\nThis article will be completely removed from Forbes Germany.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("articles").delete().eq("slug", article.slug);
      if (error) throw error;
      setArticles((prev) => prev.filter((a) => a.slug !== article.slug));
    } catch (err: any) {
      alert(`Failed to delete article: ${err.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-red-500 border-t-zinc-100" />
          <span className="text-sm tracking-wider uppercase font-mono text-zinc-400">Loading Newsroom Control...</span>
        </div>
      </div>
    );
  }

  const publishedCount = rows.filter((r) => r.status === "Published").length;
  const inReviewCount = rows.filter((r) => r.status === "In review").length;
  const draftsCount = rows.filter((r) => r.status === "Draft").length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 flex flex-col font-sans selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-clip">
      {/* Executive Dark Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090a0f] text-white border-b border-zinc-800 shadow-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Brand + Executive Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center bg-red-600 font-display font-black text-sm text-white rounded shadow-sm">
              F
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
                Forbes Germany
              </span>
              <span className="hidden lg:inline-flex text-[0.62rem] font-mono uppercase tracking-[0.2em] text-red-400 border border-red-900/60 bg-red-950/40 px-2 py-0.5 rounded whitespace-nowrap">
                Executive Control
              </span>
              <span className="hidden sm:inline-flex lg:hidden text-[0.6rem] font-mono uppercase tracking-wider text-red-400 border border-red-900/60 bg-red-950/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                Executive
              </span>
              <span className="sm:hidden text-[0.58rem] font-mono uppercase tracking-wider text-red-400 border border-red-900/60 bg-red-950/50 px-1.5 py-0.5 rounded font-bold shrink-0">
                Admin
              </span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 ml-2">
              <span className="bg-red-950/80 border border-red-500/40 text-red-300 font-mono text-[0.65rem] px-2 py-0.5 rounded uppercase tracking-wider font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck className="size-3 text-red-400" /> Super Administrator
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-mono shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-2 sm:px-2.5 py-1.5 rounded whitespace-nowrap"
              title="Open Public Portal in new tab"
            >
              <span className="hidden md:inline whitespace-nowrap">Public Portal</span>
              <ExternalLink className="size-3.5 shrink-0" />
            </a>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span
                className="size-7 rounded-full bg-red-600 text-white grid place-items-center font-bold text-xs ring-1 ring-white/20 shrink-0"
                title={userFullName || session?.user?.email}
              >
                {(userFullName?.[0] || session?.user?.email?.[0] || "A").toUpperCase()}
              </span>
              <div className="hidden lg:block text-left">
                <div className="font-medium text-white truncate max-w-[130px] leading-tight">
                  {userFullName || session?.user?.email?.split('@')[0]}
                </div>
                <div className="text-[0.62rem] text-red-400 capitalize">
                  Administrator
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/private-admin-login" });
              }}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900/80 transition-colors py-1.5 px-2 sm:px-2.5 border border-zinc-800 hover:border-red-900/60 rounded cursor-pointer whitespace-nowrap"
              title="Sign Out of Newsroom"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subnav Navigation */}
      <div className="bg-white border-b border-rule shadow-xs sticky top-14 z-30">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
          
          {/* Mobile & Tablet Dropdown Selector (< lg) */}
          <div ref={mobileNavRef} className="relative lg:hidden flex-1 min-w-0 max-w-[230px] sm:max-w-[280px]">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="flex items-center justify-between w-full gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-950 text-white shadow-xs border border-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
              aria-expanded={isMobileNavOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-2 min-w-0">
                {(() => {
                  const currentItem = [
                    { id: "all_stories", label: "Newsroom Articles", icon: Globe, count: rows.length },
                    { id: "authors", label: "Journalists & Team", icon: Users, badge: pendingCount > 0 ? `${pendingCount} Pending` : totalAuthorsCount ? `${totalAuthorsCount}` : undefined, isWarning: pendingCount > 0 },
                    { id: "editor", label: "Story Editor", icon: PenLine },
                    { id: "profile", label: "Profile & Security", icon: User },
                  ].find((t) => t.id === tab) || { id: "all_stories", label: "Newsroom Articles", icon: Globe, count: rows.length };
                  const Icon = currentItem.icon;
                  return (
                    <>
                      <Icon className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="truncate font-semibold">{currentItem.label}</span>
                      {currentItem.badge ? (
                        <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold leading-none shrink-0 ${
                          currentItem.isWarning ? "bg-amber-500 text-white animate-pulse" : "bg-red-600 text-white"
                        }`}>
                          {currentItem.badge}
                        </span>
                      ) : typeof currentItem.count === "number" ? (
                        <span className="rounded-full bg-red-600 text-white px-1.5 py-0.5 text-[0.6rem] font-bold leading-none shrink-0">
                          {currentItem.count}
                        </span>
                      ) : null}
                    </>
                  );
                })()}
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${isMobileNavOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mobile Dropdown Menu Card */}
            {isMobileNavOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-white border border-zinc-200 p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[0.62rem] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Switch Section
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {[
                    { id: "all_stories", label: "Newsroom Articles", icon: Globe, count: rows.length },
                    { id: "authors", label: "Journalists & Team", icon: Users, badge: pendingCount > 0 ? `${pendingCount} Pending` : totalAuthorsCount ? `${totalAuthorsCount}` : undefined, isWarning: pendingCount > 0 },
                    { id: "editor", label: "Story Editor", icon: PenLine },
                    { id: "profile", label: "Profile & Security", icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "editor" && tab !== "editor") {
                            setActiveArticle(null);
                          }
                          setTab(item.id as any);
                          setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isActive
                            ? "bg-zinc-950 text-white font-semibold shadow-xs"
                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-red-400" : "text-zinc-500"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {item.badge ? (
                            <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${
                              item.isWarning
                                ? "bg-amber-500 text-white animate-pulse"
                                : isActive
                                ? "bg-red-600 text-white"
                                : "bg-zinc-200 text-zinc-800"
                            }`}>
                              {item.badge}
                            </span>
                          ) : typeof item.count === "number" ? (
                            <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold leading-none ${
                              isActive ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            }`}>
                              {item.count}
                            </span>
                          ) : null}
                          {isActive && <Check className="h-3.5 w-3.5 text-red-500 ml-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1.5 mt-1.5 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      openEditor();
                      setIsMobileNavOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer justify-center shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Compose New Story</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Horizontal Tabs List (lg:) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 overflow-x-auto scrollbar-none min-w-0 flex-1 py-1 -mx-1 px-1">
            {[
              { id: "all_stories", label: "Newsroom Articles", icon: Globe, count: rows.length },
              { id: "authors", label: "Journalists & Team", icon: Users, badge: pendingCount > 0 ? `${pendingCount} Pending` : totalAuthorsCount ? `${totalAuthorsCount}` : undefined, isWarning: pendingCount > 0 },
              { id: "editor", label: "Story Editor", icon: PenLine },
              { id: "profile", label: "Profile & Security", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "editor" && tab !== "editor") {
                      setActiveArticle(null);
                    }
                    setTab(item.id as any);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold leading-none shrink-0 ${
                        item.isWarning
                          ? "bg-amber-500 text-white animate-pulse"
                          : isActive
                          ? "bg-red-600 text-white"
                          : "bg-zinc-200 text-zinc-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && !item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold leading-none shrink-0 ${
                        isActive ? "bg-red-600 text-white" : "bg-zinc-200 text-zinc-800"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Compose Button */}
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wider rounded-lg sm:rounded transition-all shrink-0 shadow-xs cursor-pointer ml-auto max-w-fit"
            title="Compose New Story"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Compose Story</span>
            <span className="sm:hidden">Compose</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-[1400px] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        {tab === "all_stories" && (
          <>
            {/* Executive Modern Editorial Stats (NO TOTAL VIEWS COUNTER) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 mb-5 sm:mb-6">
              {[
                {
                  label: "Total Articles",
                  value: rows.length,
                  icon: FileText,
                  badgeText: "Newsroom",
                  badgeStyle: "bg-zinc-100 text-zinc-800 border-zinc-200",
                },
                {
                  label: "Published Live",
                  value: publishedCount,
                  icon: CheckCircle2,
                  badgeText: "Live",
                  badgeStyle: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                },
                {
                  label: "In Review",
                  value: inReviewCount,
                  icon: Clock,
                  badgeText: "Pending Edit",
                  badgeStyle: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                },
                {
                  label: "Journalists & Staff",
                  value: totalAuthorsCount || "—",
                  icon: Users,
                  badgeText: pendingCount > 0 ? `${pendingCount} Waiting` : "Active Team",
                  badgeStyle: pendingCount > 0 ? "bg-amber-500 text-white font-bold" : "bg-blue-500/10 text-blue-700 border-blue-500/20",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="bg-white border border-rule p-3 sm:p-5 rounded-lg shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-1">
                      <span className="text-[0.68rem] sm:text-xs font-bold uppercase tracking-wider text-ink-soft line-clamp-1">
                        {card.label}
                      </span>
                      <span className={`text-[0.58rem] sm:text-[0.62rem] font-bold px-1.5 sm:px-2 py-0.5 rounded border uppercase shrink-0 whitespace-nowrap ${card.badgeStyle}`}>
                        {card.badgeText}
                      </span>
                    </div>
                    <div className="mt-2.5 sm:mt-3 flex items-baseline justify-between">
                      <p className="font-display text-xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {card.value}
                      </p>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Editorial Feed Header & Search / Filters */}
            <section className="bg-white border border-rule rounded-lg p-3.5 sm:p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-rule pb-4">
                <div>
                  <h2 className="headline text-lg sm:text-[1.4rem] text-foreground">
                    Editorial Feed & Story Archive
                  </h2>
                  <p className="text-xs sm:text-[0.82rem] text-ink-soft mt-0.5">
                    As an <strong className="text-foreground">Administrator</strong>, you have full editorial privileges to edit, review, or remove any story across Forbes Germany.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title, author, deck..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs sm:text-[0.8rem] border border-rule rounded bg-background focus:border-zinc-950 outline-none w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-rule rounded px-3 py-1.5 text-xs sm:text-[0.8rem] font-medium bg-background text-zinc-800 outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {navCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[0.7rem] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="size-3" /> Status:
                </span>
                {(["All", ...statuses] as const).map((s) => {
                  const count = s === "All" ? rows.length : rows.filter((r) => r.status === s).length;
                  return (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`border px-2.5 sm:px-3 py-1 text-[0.7rem] sm:text-[0.75rem] font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                        filter === s
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-rule text-zinc-600 hover:border-zinc-950"
                      }`}
                    >
                      <span>{s}</span>
                      <span className={`text-[0.62rem] sm:text-[0.65rem] px-1.5 py-0.2 rounded-full ${
                        filter === s ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Articles List (WITHOUT TOTAL VIEWS COUNTER) */}
              {visible.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-rule rounded-lg bg-zinc-50/50 my-6 p-8">
                  <FileText className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
                  <h3 className="font-display text-[1.2rem] text-zinc-800">No stories match your criteria</h3>
                  <p className="mt-1 text-[0.85rem] text-zinc-500 max-w-md mx-auto">
                    Try clearing the search query or status filter to see other newsroom stories.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-rule border-t border-rule">
                  {visible.map(({ article, status, isOwner }) => (
                    <li key={article.slug} className="py-4 hover:bg-zinc-50/70 transition-colors px-2 rounded">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-start gap-3 sm:contents">
                          <img
                            src={article.image}
                            alt=""
                            className="h-16 w-20 sm:h-16 sm:w-24 shrink-0 object-cover bg-secondary rounded"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-red-600 font-mono">
                                {article.category}
                              </span>
                              {isOwner && (
                                <span className="border border-blue-500/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.2 text-[0.62rem] font-bold uppercase tracking-wider rounded">
                                  Authored by You
                                </span>
                              )}
                            </div>
                            <Link
                              to="/article/$slug"
                              params={{ slug: article.slug || "unknown" }}
                              className="mt-1 block font-display text-[1.05rem] sm:text-[1.1rem] leading-snug hover:text-red-600 line-clamp-2 text-foreground font-semibold"
                            >
                              {article.title || "Untitled Story"}
                            </Link>
                            <p className="mt-1 text-[0.76rem] sm:text-[0.8rem] text-ink-soft">
                              <span className="font-medium text-foreground">
                                {typeof article.author === "string" ? article.author : article.author?.name || "Staff Writer"}
                              </span> · {article.published} · {article.readTime} min read
                            </p>
                          </div>
                        </div>

                        {/* Article Status Badge & Executive Actions */}
                        <div className="flex shrink-0 items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-2.5 sm:pt-0 border-t border-rule/50 sm:border-t-0 text-[0.8rem]">
                          <span
                            className={`border px-2 sm:px-2.5 py-0.5 font-semibold text-[0.68rem] sm:text-[0.72rem] rounded uppercase tracking-wider shrink-0 ${
                              status === "Published"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                : status === "In review"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                                : "border-zinc-300 bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {status}
                          </span>

                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <Link
                              to="/article/$slug"
                              params={{ slug: article.slug || "unknown" }}
                              className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-950 px-2 py-1 border border-rule hover:border-zinc-400 transition-colors text-[0.72rem] sm:text-[0.75rem] rounded"
                              title="Preview Article on Live Site"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="hidden xs:inline">Preview</span>
                            </Link>
                            <button
                              onClick={() => openEditor(article)}
                              className="inline-flex items-center gap-1 font-semibold text-zinc-950 hover:text-red-600 px-2 sm:px-2.5 py-1 border border-rule hover:border-zinc-950 transition-colors text-[0.72rem] sm:text-[0.75rem] rounded cursor-pointer"
                              title="Edit Story"
                            >
                              <Edit2 className="h-3 w-3 shrink-0" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article)}
                              className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 px-2 py-1 border border-red-200 hover:border-red-400 bg-red-50/60 hover:bg-red-50 transition-colors text-[0.72rem] sm:text-[0.75rem] rounded cursor-pointer"
                              title="Delete Story from Forbes"
                            >
                              <Trash2 className="h-3 w-3 shrink-0" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "authors" && (
          <AuthorsManager session={session} onPendingChange={(c) => setPendingCount(c)} />
        )}

        {tab === "editor" && (
          <Editor
            key={activeArticle?.slug || "new"}
            initialArticle={activeArticle}
            onClose={handleEditorClose}
            session={session}
            userFullName={userFullName}
            isAdmin={true}
            isOwner={() => true}
          />
        )}

        {tab === "profile" && (
          <ProfileManager session={session} />
        )}
      </main>
    </div>
  );
}
