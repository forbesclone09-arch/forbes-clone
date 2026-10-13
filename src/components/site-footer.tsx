import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

import { categoryFeatures, featuredArticle, recentArticles, siteName } from "@/data/content";

type FooterLink =
  | { label: string; to: "/about" | "/contact" | "/privacy" | "/signup" | "/login" | "/" }
  | { label: string; category: "Business" | "Tech" | "Startups" };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Sections",
    links: [
      { label: "News", to: "/" },
      { label: "Business", category: "Business" },
      { label: "Tech", category: "Tech" },
      { label: "Startups", category: "Startups" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact us", to: "/contact" },
      { label: `Advertise with ${siteName}`, to: "/contact" },
      { label: "Write for us", to: "/signup" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Founders", category: "Startups" },
      { label: "Markets", category: "Business" },
      { label: "Innovation", category: "Tech" },
      { label: "Contributor sign in", to: "/login" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
  { label: "X", href: "https://x.com", Icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
];

const linkClass = "text-[0.92rem] text-background/85 transition-colors hover:text-brand";
const inputClass =
  "mt-2 h-10 w-full border border-background/80 bg-transparent px-3 text-sm text-background outline-none focus:border-brand";

function FooterNavLink({ link }: { link: FooterLink }) {
  if ("category" in link) {
    return (
      <Link to="/category/$category" params={{ category: link.category.toLowerCase() }} className={linkClass}>
        {link.label}
      </Link>
    );
  }
  return (
    <Link to={link.to} className={linkClass}>
      {link.label}
    </Link>
  );
}

function Cover({ image, title, className }: { image: string; title: string; className?: string }) {
  return (
    <div className={`overflow-hidden border border-background/20 ${className ?? ""}`}>
      <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-transparent to-foreground/80" />
      <span className="absolute inset-x-0 top-2 text-center font-display text-xl font-semibold text-hero-ink">
        {siteName}
      </span>
      <span className="absolute inset-x-2 bottom-2 font-display text-[0.7rem] leading-tight font-semibold text-hero-ink uppercase line-clamp-3">
        {title}
      </span>
    </div>
  );
}

export function SiteFooter() {
  const [done, setDone] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <footer className="mt-20 bg-foreground text-background">
      <div className="mx-auto w-full max-w-[1240px] px-5 pt-16 pb-8 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <Link to="/" className="group flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none font-bold tracking-tight text-background">
                Forbes
              </span>
              <span className="font-sans text-[0.7rem] font-bold tracking-[0.24em] uppercase text-brand">
                Germany
              </span>
            </Link>
          </div>

          <div className="lg:col-span-4">
            <p className="text-[0.95rem] font-medium">The best of {siteName}, delivered to your inbox</p>
            {done ? (
              <p className="mt-6 border border-background/40 p-4 text-sm text-background/85">
                Thanks — this is a demo, so no email was saved or sent.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-5 max-w-sm space-y-4">
                <label className="block text-xs font-semibold">
                  Email*
                  <input type="email" required className={inputClass} />
                </label>
                <label className="block text-xs font-semibold">
                  First name*
                  <input required className={inputClass} />
                </label>
                <label className="block text-xs font-semibold">
                  Last name*
                  <input required className={inputClass} />
                </label>
                <label className="flex items-start gap-2 text-xs text-background/85">
                  <input type="checkbox" required className="mt-0.5 accent-brand" />
                  <span>
                    I accept {siteName}&apos;s{" "}
                    <Link to="/privacy" className="underline hover:text-brand">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                <button
                  type="submit"
                  className="border border-background px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background hover:text-foreground"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-display text-lg font-medium">{col.title}</h2>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterNavLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:col-start-3">
            <div className="flex items-end gap-6">
              <Cover image={featuredArticle.image} title={featuredArticle.title} className="relative aspect-[3/4] w-36 shrink-0" />
              <div className="relative h-52 w-44 shrink-0">
                <Cover image={(categoryFeatures[0] ?? featuredArticle).image} title={(categoryFeatures[0] ?? featuredArticle).title} className="absolute top-0 right-0 aspect-[3/4] w-24" />
                <Cover image={(recentArticles[0] ?? featuredArticle).image} title={(recentArticles[0] ?? featuredArticle).title} className="absolute bottom-0 left-0 aspect-[3/4] w-24" />
              </div>
            </div>
            <p className="mt-8 max-w-sm text-[0.92rem] leading-relaxed text-background/85">
              Get the magazine delivered with a Premium membership, find it at good newsagents, or{" "}
              <Link to="/contact" className="text-brand underline">
                ask about previous issues
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-6">
            <h2 className="font-display text-lg font-medium">Social</h2>
            <ul className="mt-4 flex gap-5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-background/85 transition-colors hover:text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-background/25 pt-5 text-xs text-background/70 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteName} Media Group. All rights reserved.</p>
          <Link to="/privacy" className="hover:text-brand">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
