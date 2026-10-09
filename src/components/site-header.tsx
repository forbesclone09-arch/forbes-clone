import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bell, ChevronDown, Menu, Search, Settings2, X, LayoutDashboard, LogOut } from "lucide-react";

import { allArticles, briefingItems, featuredArticle, mostRead, navCategories, recentArticles, siteName, type Article, type CategoryName } from "@/data/content";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

function Wordmark() {
  return (
    <Link
      to="/"
      className="group flex min-w-0 items-center gap-2.5"
      aria-label={`${siteName} home`}
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center bg-foreground font-display text-[1.05rem] leading-none text-background transition-colors group-hover:bg-brand"
      >
        M
      </span>
      <span className="truncate font-display text-[1.45rem] leading-none font-semibold tracking-tight">
        {siteName}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<"account" | "notifications" | "settings">("account");
  const [accountSection, setAccountSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setMenuOpen(false); setAccountOpen(false); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, accountOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setSearch("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccountOpen(false);
    navigate({ to: "/" });
  };

  const query = search.trim().toLowerCase();
  const results = query
    ? allArticles.filter((article) =>
        [article.title, article.category, article.author.name, article.deck].some((value) =>
          value.toLowerCase().includes(query),
        ),
      )
    : [];

  function MenuArticleLink({ article }: { article: Article }) {
    return (
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        onClick={closeMenu}
        className="block py-1 text-[0.82rem] leading-snug text-background/85 transition-colors hover:text-brand focus-visible:text-brand"
      >
        {article.title}
      </Link>
    );
  }

  function CategoryColumn({ category }: { category: CategoryName }) {
    return (
      <section className="min-w-0 border-t border-background/20 pt-5">
        <Link
          to="/category/$category"
          params={{ category: category.toLowerCase() }}
          onClick={closeMenu}
          className="group mb-4 inline-flex items-center gap-2 text-base font-semibold text-background hover:text-brand"
        >
          {category} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
        <div className="space-y-2">
          {allArticles.filter((article) => article.category === category).map((article) => (
            <MenuArticleLink key={article.slug} article={article} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background">
      <div className="bg-foreground text-background">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <div className="grid min-h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
          <div className="flex items-center gap-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => { setAccountOpen(false); menuOpen ? closeMenu() : setMenuOpen(true); }}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="size-9 rounded-none text-background hover:bg-background/15 hover:text-background"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <nav className="hidden items-center gap-5 lg:flex" aria-label="Categories">
            {navCategories.map((category) => (
              <Link key={category} to="/category/$category" params={{ category: category.toLowerCase() }} onClick={closeMenu} className="text-[0.7rem] font-semibold uppercase text-background/80 hover:text-background">{category}</Link>
            ))}
          </nav>
          </div>
          <div className="justify-self-center text-background [&_a]:gap-0 [&_span:first-child]:hidden [&_span:last-child]:text-[1.85rem] sm:[&_span:last-child]:text-[2.1rem]"><Wordmark /></div>

          <div className="flex items-center gap-2 justify-self-end sm:gap-5">
            {!session && <Link to="/signup" onClick={() => setAccountOpen(false)} className="hidden text-[0.78rem] font-semibold text-background/85 hover:text-background lg:inline-flex">Sign up</Link>}
            {!session && <Link to="/contact" onClick={() => setAccountOpen(false)} className="hidden bg-brand px-4 py-2.5 text-[0.78rem] font-semibold text-brand-foreground hover:bg-brand/85 sm:inline-flex">Subscribe</Link>}
            {session && <Link to="/dashboard" onClick={() => setAccountOpen(false)} className="hidden text-[0.78rem] font-semibold text-background/85 hover:text-background lg:inline-flex">Dashboard</Link>}
            <Button type="button" variant="ghost" onClick={() => { closeMenu(); setAccountOpen((open) => !open); }} aria-expanded={accountOpen} aria-controls="account-panel" aria-label="Open account panel" className="h-9 gap-2 rounded-full border border-background/20 bg-background/10 px-2 text-background hover:bg-background/20 hover:text-background">
              <span className="grid size-6 place-items-center rounded-full bg-foreground font-display text-base font-semibold text-background ring-1 ring-background/40">{session ? session.user.email?.[0].toUpperCase() : 'M'}</span><ChevronDown className="size-3" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
      </div>

      {!menuOpen && <div className="border-t border-rule bg-paper">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-1.5 px-5 py-2.5 sm:flex-row sm:gap-12 sm:px-8">
          {briefingItems.map((item) => (
            <Link
              key={item.slug}
              to="/article/$slug"
              params={{ slug: item.slug }}
              className="flex min-w-0 items-baseline gap-2.5"
            >
              <span className="kicker shrink-0">{item.label}</span>
              <span className="truncate text-[0.8rem] text-ink-soft transition-colors hover:text-foreground">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>}

      {menuOpen && (
        <div id="site-menu" className="absolute left-0 right-0 top-full min-h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-background/20 bg-foreground text-background">
          <div className="mx-auto max-w-[1240px] px-5 pb-10 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-background/20 py-5">
              <label className="flex h-10 w-full max-w-sm items-center gap-3 bg-background px-3 text-foreground sm:w-80">
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">Search stories</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search stories and authors"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-soft"
                />
              </label>
              <div className="flex flex-wrap gap-5 text-xs font-semibold text-background/75">
                <Link to="/about" onClick={closeMenu} className="hover:text-brand">About Us</Link>
                <Link to="/contact" onClick={closeMenu} className="hover:text-brand">Contact</Link>
                <Link to="/privacy" onClick={closeMenu} className="hover:text-brand">Privacy Policy</Link>
                {!session && <Link to="/signup" onClick={closeMenu} className="hover:text-brand">Sign up</Link>}
              </div>
            </div>

            {query ? (
              <nav aria-label="Search results" className="py-8">
                <h2 className="mb-5 text-lg font-semibold">Search results <span className="text-sm font-normal text-background/60">({results.length})</span></h2>
                {results.length ? (
                  <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((article) => (
                      <div key={article.slug} className="border-t border-background/20 pt-3">
                        <span className="text-[0.68rem] font-semibold uppercase text-brand">{article.category}</span>
                        <MenuArticleLink article={article} />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-background/70">No stories found. Try another search.</p>}
              </nav>
            ) : (
              <div className="grid gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
                <nav aria-label="Explore Meridian" className="grid content-start gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  <section className="min-w-0 border-t border-background/20 pt-5">
                    <h2 className="mb-4 text-base font-semibold">Featured</h2>
                    <div className="space-y-2">
                      <MenuArticleLink article={featuredArticle} />
                      {recentArticles.slice(0, 2).map((article) => <MenuArticleLink key={article.slug} article={article} />)}
                    </div>
                  </section>
                  {navCategories.map((category) => <CategoryColumn key={category} category={category} />)}
                </nav>
                <aside className="border-t border-background/20 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <h2 className="mb-4 text-base font-semibold">Editor&apos;s pick</h2>
                  <Link to="/article/$slug" params={{ slug: featuredArticle.slug }} onClick={closeMenu} className="group block">
                    <img src={featuredArticle.image} alt="" className="aspect-[3/2] w-full object-cover" />
                    <span className="mt-4 block text-[0.68rem] font-semibold uppercase text-brand">{featuredArticle.category}</span>
                    <span className="mt-2 block font-display text-xl font-semibold leading-tight group-hover:text-brand">{featuredArticle.title}</span>
                    <span className="mt-2 block text-xs text-background/60">By {featuredArticle.author.name}</span>
                  </Link>
                  <div className="mt-6 border-t border-background/20 pt-5">
                    <h2 className="mb-3 text-base font-semibold">Most Read</h2>
                    {mostRead.slice(0, 3).map((item) => (
                      <Link key={item.rank} to="/article/$slug" params={{ slug: item.slug }} onClick={closeMenu} className="flex gap-3 border-b border-background/15 py-2.5 text-[0.8rem] leading-snug text-background/85 hover:text-brand">
                        <span className="font-display text-lg text-background/45">{String(item.rank).padStart(2, "0")}</span>
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      )}
      {accountOpen && (
        <>
          <div className="fixed inset-0 top-[64px] bg-foreground/35" onClick={() => setAccountOpen(false)} aria-hidden="true" />
          <aside id="account-panel" aria-label="Account panel" className="fixed bottom-0 right-0 top-0 z-[60] w-full max-w-[440px] overflow-y-auto bg-foreground px-7 pb-10 text-background sm:px-9">
            <div className="flex h-[68px] items-center justify-between">
              <span className="font-display text-3xl font-semibold" aria-label={siteName}>M</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => setAccountOpen(false)} aria-label="Close account panel" className="size-8 rounded-full bg-background/10 text-background hover:bg-background/20 hover:text-background"><X className="size-4" /></Button>
            </div>
            <div role="tablist" aria-label="Account views" className="flex items-stretch gap-4 border-b border-background/20 sm:gap-6">
              <Button type="button" role="tab" aria-selected={accountTab === "account"} onClick={() => setAccountTab("account")} variant="ghost" className={`h-12 rounded-none border-b-2 px-1 text-sm font-semibold hover:bg-transparent hover:text-background ${accountTab === "account" ? "border-background text-background" : "border-transparent text-background/75"}`}>My Account</Button>
              <Button type="button" role="tab" aria-selected={accountTab === "notifications"} onClick={() => setAccountTab("notifications")} variant="ghost" className={`h-12 rounded-none border-b-2 px-1 text-sm font-semibold hover:bg-transparent hover:text-background ${accountTab === "notifications" ? "border-background text-background" : "border-transparent text-background/75"}`}>Notifications</Button>
              <Button type="button" role="tab" aria-selected={accountTab === "settings"} onClick={() => setAccountTab("settings")} variant="ghost" aria-label="Settings" title="Settings" className={`h-12 rounded-none border-b-2 px-1 hover:bg-transparent hover:text-background ${accountTab === "settings" ? "border-background text-background" : "border-transparent text-background/75"}`}><Settings2 className="size-4" /></Button>
            </div>
            {accountTab === "account" ? (
              <div className="pt-2">
                {session ? (
                  <>
                    <p className="mb-4 pt-4 text-sm font-semibold text-background/90">{session.user.email}</p>
                    <Link
                      to="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="group flex items-center gap-3 border-b border-background/20 py-4 text-sm font-semibold text-background hover:text-brand"
                    >
                      <LayoutDashboard className="size-4" /> Go to Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="group flex w-full items-center gap-3 border-b border-background/20 py-4 text-left text-sm font-semibold text-background hover:text-brand"
                    >
                      <LogOut className="size-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {(["For You", "Newsletters", "Reading List"] as const).map((section) => (
                      <div key={section} className="border-b border-background/20">
                        <Button variant="ghost" type="button" aria-expanded={accountSection === section} onClick={() => setAccountSection(accountSection === section ? null : section)} className="flex h-[72px] w-full justify-between rounded-none px-0 text-left text-sm font-semibold text-background hover:bg-transparent hover:text-background">{section}<ChevronDown className={`size-4 transition-transform ${accountSection === section ? "rotate-180" : ""}`} /></Button>
                        {accountSection === section && <p className="pb-5 text-sm leading-relaxed text-background/65">{section === "For You" ? "Your personalized stories will appear here when you sign in." : section === "Newsletters" ? "Sign in to see the newsletters you follow." : "Sign in to see your saved stories."}</p>}
                      </div>
                    ))}
                    <p className="mt-7 text-sm text-background/90">Already have an account? <Link to="/login" onClick={() => setAccountOpen(false)} className="font-semibold underline underline-offset-2 hover:text-brand">Sign In</Link></p>
                    <p className="mt-2 text-sm text-background/90">New contributor? <Link to="/signup" onClick={() => setAccountOpen(false)} className="font-semibold underline underline-offset-2 hover:text-brand">Create an account</Link></p>
                  </>
                )}
              </div>
            ) : accountTab === "notifications" ? (
              <div className="pt-9"><Bell className="size-5 text-background/70" aria-hidden="true" /><h2 className="mt-4 text-base font-semibold">Notifications</h2><p className="mt-2 text-sm leading-relaxed text-background/65">{session ? "You have no new notifications." : "Sign in to see your notifications."}</p>{!session && <Link to="/login" onClick={() => setAccountOpen(false)} className="mt-5 inline-block text-sm font-semibold underline underline-offset-2">Sign In</Link>}</div>
            ) : (
              <div className="pt-9"><h2 className="text-base font-semibold">Account settings</h2><p className="mt-2 text-sm leading-relaxed text-background/65">{session ? "Manage your account preferences here." : "Sign in to manage your account preferences."}</p>{!session && <Link to="/login" onClick={() => setAccountOpen(false)} className="mt-5 inline-block text-sm font-semibold underline underline-offset-2">Sign In</Link>}</div>
            )}
          </aside>
        </>
      )}
    </header>
  );
}
