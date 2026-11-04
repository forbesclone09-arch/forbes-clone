import { useState, useMemo } from "react";
import {
  RotateCcw,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  X,
  Sparkles,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { navCategories } from "@/data/content";
import {
  type ArticleRow,
  getTrashRetentionInfo,
  TRASH_RETENTION_DAYS,
} from "@/components/dashboard/shared";

interface RestoreTabProps {
  trashedArticles: ArticleRow[];
  onRestore: (article: ArticleRow) => Promise<void>;
  onPermanentDelete: (article: ArticleRow) => Promise<void>;
  isAdmin?: boolean;
  onRefresh?: () => Promise<void>;
}

export function RestoreTab({
  trashedArticles,
  onRestore,
  onPermanentDelete,
  isAdmin = false,
  onRefresh,
}: RestoreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [retentionFilter, setRetentionFilter] = useState<"All" | "Restorable" | "ExpiringSoon" | "Expired">("All");
  const [previewArticle, setPreviewArticle] = useState<ArticleRow | null>(null);
  const [actionLoadingSlug, setActionLoadingSlug] = useState<string | null>(null);
  const [isRestoringAll, setIsRestoringAll] = useState(false);

  // Compute stats
  const itemsWithRetention = useMemo(() => {
    return trashedArticles.map((article) => {
      const retention = getTrashRetentionInfo(article.deleted_at);
      return { article, retention };
    });
  }, [trashedArticles]);

  const expiringSoonCount = useMemo(() => {
    return itemsWithRetention.filter(
      ({ retention }) => retention && retention.daysRemaining > 0 && retention.daysRemaining <= 7
    ).length;
  }, [itemsWithRetention]);

  const restorableCount = useMemo(() => {
    return itemsWithRetention.filter(
      ({ retention }) => !retention || retention.daysRemaining > 0
    ).length;
  }, [itemsWithRetention]);

  // Filtered stories
  const filtered = useMemo(() => {
    return itemsWithRetention.filter(({ article, retention }) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const titleStr = (article.title || "").toLowerCase();
        const deckStr = (article.deck || "").toLowerCase();
        const authorStr = (
          typeof article.author === "string"
            ? article.author
            : article.author?.name || ""
        ).toLowerCase();
        const catStr = (article.category || "").toLowerCase();

        if (
          !titleStr.includes(q) &&
          !deckStr.includes(q) &&
          !authorStr.includes(q) &&
          !catStr.includes(q)
        ) {
          return false;
        }
      }

      // 2. Category
      if (categoryFilter !== "All") {
        if ((article.category || "").toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Retention Filter
      if (retentionFilter === "Restorable") {
        if (retention && retention.isExpired) return false;
      } else if (retentionFilter === "ExpiringSoon") {
        if (!retention || retention.daysRemaining <= 0 || retention.daysRemaining > 7) return false;
      } else if (retentionFilter === "Expired") {
        if (!retention || !retention.isExpired) return false;
      }

      return true;
    });
  }, [itemsWithRetention, searchQuery, categoryFilter, retentionFilter]);

  const handleRestoreClick = async (article: ArticleRow) => {
    setActionLoadingSlug(article.slug);
    try {
      await onRestore(article);
      if (previewArticle?.slug === article.slug) {
        setPreviewArticle(null);
      }
    } finally {
      setActionLoadingSlug(null);
    }
  };

  const handlePermanentDeleteClick = async (article: ArticleRow) => {
    setActionLoadingSlug(article.slug);
    try {
      await onPermanentDelete(article);
      if (previewArticle?.slug === article.slug) {
        setPreviewArticle(null);
      }
    } finally {
      setActionLoadingSlug(null);
    }
  };

  const handleRestoreAll = async () => {
    if (filtered.length === 0) return;
    const confirmed = window.confirm(
      `Restore all ${filtered.length} currently listed stories back to the active newsroom?`
    );
    if (!confirmed) return;

    setIsRestoringAll(true);
    try {
      for (const item of filtered) {
        await onRestore(item.article);
      }
    } finally {
      setIsRestoringAll(false);
      if (onRefresh) await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* 30-Day Trash Retention Header Notice */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-xs">
              <RotateCcw className="size-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                  Trash & Story Restoration
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700 border border-emerald-500/20">
                  <Clock className="size-3" /> 30-Day Retention Active
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                Articles deleted from Forbes Germany are safely retained here for{" "}
                <strong className="text-zinc-900 font-semibold">30 calendar days</strong>.
                Mistakenly removed stories can be restored with a single click — retaining all original formatting, image assets, author attribution, and revision history.
              </p>
            </div>
          </div>

          {filtered.length > 1 && (
            <button
              onClick={handleRestoreAll}
              disabled={isRestoringAll}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shrink-0"
              title="Restore all listed articles"
            >
              <RotateCcw className={`size-3.5 ${isRestoringAll ? "animate-spin" : ""}`} />
              <span>{isRestoringAll ? "Restoring Stories..." : `Restore All Filtered (${filtered.length})`}</span>
            </button>
          )}
        </div>

        {/* 3-Column Metrics Snapshot */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-100 pt-4">
          <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500">
                Stories in Trash
              </span>
              <Trash2 className="size-3.5 text-zinc-400" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-zinc-900">
              {trashedArticles.length}
            </p>
            <p className="text-[0.7rem] text-zinc-500 mt-0.5">
              Available for restoration or purge
            </p>
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500">
                Restorable Stories
              </span>
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
              {restorableCount}
            </p>
            <p className="text-[0.7rem] text-zinc-500 mt-0.5">
              Within 30-day safety period
            </p>
          </div>

          <div className="rounded-lg bg-zinc-50 border border-zinc-200/80 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-500">
                Expiring Soon
              </span>
              <AlertTriangle className="size-3.5 text-amber-500" />
            </div>
            <p className={`mt-1 font-display text-2xl font-bold ${expiringSoonCount > 0 ? "text-amber-600" : "text-zinc-900"}`}>
              {expiringSoonCount}
            </p>
            <p className="text-[0.7rem] text-zinc-500 mt-0.5">
              ≤ 7 days before permanent expiry
            </p>
          </div>
        </div>
      </div>

      {/* Main Filter & Stories List Section */}
      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="headline text-base sm:text-lg text-zinc-950 font-bold">
              Deleted Articles Archive
            </h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[0.7rem] font-bold text-zinc-600 border border-zinc-200">
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="size-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, author, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg bg-zinc-50/50 focus:bg-white focus:border-zinc-950 outline-none transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-zinc-50/50 focus:bg-white text-zinc-800 outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {navCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Retention Filter Pills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="size-3" /> Retention:
          </span>
          {[
            { id: "All", label: "All Trashed", count: trashedArticles.length },
            { id: "Restorable", label: "Within 30 Days", count: restorableCount },
            { id: "ExpiringSoon", label: "Expiring Soon (≤ 7d)", count: expiringSoonCount },
          ].map((pill) => {
            const isActive = retentionFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setRetentionFilter(pill.id as any)}
                className={`border px-2.5 py-1 text-[0.7rem] font-semibold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[0.62rem] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Story List / Empty State */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40 my-4 p-8">
            <div className="size-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <CheckCircle2 className="size-6 text-zinc-400" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-zinc-900">
              {trashedArticles.length === 0
                ? "Trash is Clean & Empty"
                : "No stories match your filter"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
              {trashedArticles.length === 0
                ? "When articles are deleted from the newsroom, they will be preserved here for 30 calendar days for instant recovery."
                : "Try clearing search keywords or switching filters to view other trashed stories."}
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
            {filtered.map(({ article, retention }) => {
              const isLoading = actionLoadingSlug === article.slug;
              const daysRemaining = retention?.daysRemaining ?? TRASH_RETENTION_DAYS;
              const percentRemaining = retention?.percentRemaining ?? 100;
              const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
              const isExpired = retention?.isExpired ?? false;

              const formattedDeletedDate = article.deleted_at
                ? new Date(article.deleted_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              return (
                <li
                  key={article.slug}
                  className="py-4 hover:bg-zinc-50/70 transition-colors px-2 rounded-lg"
                >
                  <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:gap-5">
                    {/* Story Thumbnail & Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200">
                        <img
                          src={article.image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80"}
                          alt=""
                          className="h-full w-full object-cover grayscale opacity-80"
                        />
                        <div className="absolute inset-0 bg-red-950/20 backdrop-grayscale" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-red-600 font-mono">
                            {article.category || "General"}
                          </span>

                          {/* Retention Countdown Pill */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold tracking-wide border ${
                              isExpired
                                ? "bg-red-500/10 text-red-700 border-red-500/20"
                                : isUrgent
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/30 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            }`}
                          >
                            <Clock className="size-3 shrink-0" />
                            {isExpired
                              ? "Retention Expired (30+ days)"
                              : isUrgent
                              ? `Expiring Soon: ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} left`
                              : `${daysRemaining} days left to restore`}
                          </span>
                        </div>

                        <h4 className="mt-1 font-display text-[0.98rem] sm:text-[1.05rem] font-bold leading-snug text-zinc-900 line-clamp-1">
                          {article.title || "Untitled Article"}
                        </h4>

                        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                          {article.deck || "No description excerpt available."}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.72rem] text-zinc-400">
                          <span>
                            By{" "}
                            <strong className="text-zinc-600 font-medium">
                              {typeof article.author === "string"
                                ? article.author
                                : article.author?.name || "Staff Writer"}
                            </strong>
                          </span>
                          <span>·</span>
                          <span>Deleted: {formattedDeletedDate}</span>
                        </div>

                        {/* 30-Day Retention Progress Bar */}
                        <div className="mt-2 flex items-center gap-2 max-w-xs">
                          <div className="h-1.5 flex-1 rounded-full bg-zinc-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isExpired
                                  ? "bg-red-500"
                                  : isUrgent
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                          <span className="text-[0.62rem] font-mono font-semibold text-zinc-500 shrink-0">
                            {daysRemaining}d / {TRASH_RETENTION_DAYS}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Group */}
                    <div className="flex shrink-0 items-center justify-end gap-2 pt-2 lg:pt-0 border-t border-zinc-100 lg:border-t-0">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewArticle(article)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
                        title="Inspect article content before restoring"
                      >
                        <Eye className="size-3.5 text-zinc-500" />
                        <span>Preview</span>
                      </button>

                      {/* Restore Button */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleRestoreClick(article)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                        title="Restore this article to active newsroom"
                      >
                        <RotateCcw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        <span>{isLoading ? "Restoring..." : "Restore Story"}</span>
                      </button>

                      {/* Permanent Delete Button */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handlePermanentDeleteClick(article)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        title="Permanently remove story from database"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">Delete Permanently</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Story Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded bg-red-600 text-white font-black font-display text-xs">
                  F
                </span>
                <div>
                  <h3 className="font-display font-bold text-sm text-zinc-950">
                    Story Preview (In 30-Day Trash)
                  </h3>
                  <span className="text-[0.7rem] text-zinc-500 font-mono">
                    slug: {previewArticle.slug}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRestoreClick(previewArticle)}
                  disabled={actionLoadingSlug === previewArticle.slug}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Restore Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-600">
                  {previewArticle.category}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-xs text-zinc-500">
                  {previewArticle.readTime} min read
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 leading-tight">
                {previewArticle.title}
              </h2>

              <p className="text-sm sm:text-base font-serif italic text-zinc-600 leading-relaxed border-l-2 border-red-600 pl-3">
                {previewArticle.deck}
              </p>

              <div className="flex items-center gap-2 py-2 border-y border-zinc-100 text-xs text-zinc-500">
                <span>
                  Author:{" "}
                  <strong className="text-zinc-800">
                    {typeof previewArticle.author === "string"
                      ? previewArticle.author
                      : previewArticle.author?.name || "Staff Writer"}
                  </strong>
                </span>
                <span>·</span>
                <span>Originally Published: {previewArticle.published}</span>
              </div>

              {previewArticle.image && (
                <div className="rounded-xl overflow-hidden bg-zinc-100 max-h-80 border border-zinc-200">
                  <img
                    src={previewArticle.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Story Body Paragraphs */}
              <div className="space-y-3 pt-2 text-zinc-800 text-sm leading-relaxed font-serif">
                {Array.isArray(previewArticle.body) && previewArticle.body.length > 0 ? (
                  previewArticle.body.map((item: any, idx: number) => {
                    if (typeof item === "string") {
                      return <p key={idx}>{item}</p>;
                    }
                    if (item?.type === "paragraph" && item?.content) {
                      return (
                        <p
                          key={idx}
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      );
                    }
                    return null;
                  })
                ) : (
                  <p className="italic text-zinc-400">
                    No rich text paragraphs recorded for this story.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 bg-zinc-50 text-xs">
              <span className="text-zinc-500">
                Restoring will return this article to the live newsroom immediately.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewArticle(null)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleRestoreClick(previewArticle)}
                  disabled={actionLoadingSlug === previewArticle.slug}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Restore to Newsroom</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
