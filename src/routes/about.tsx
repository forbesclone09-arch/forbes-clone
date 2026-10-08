import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { SectionHeading } from "@/components/article-card";
import { authors, siteName } from "@/data/content";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `About Us — ${siteName}` },
      {
        name: "description",
        content: `How the ${siteName} newsroom works: what we cover, how we report it, and who writes it.`,
      },
      { property: "og:title", content: `About Us — ${siteName}` },
      {
        property: "og:description",
        content: `How the ${siteName} newsroom works: what we cover, how we report it, and who writes it.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const newsroom = [
  { author: authors.nadiaRahman, beat: "Global commerce, supply chains, retail" },
  { author: authors.eliasVargas, beat: "Enterprise software and applied AI" },
  { author: authors.priyaAnand, beat: "Early-stage funding and founder strategy" },
  { author: authors.marcusWhitfield, beat: "Markets, commercial property, logistics" },
  { author: authors.danielOkafor, beat: "Semiconductors and advanced manufacturing" },
  { author: authors.sofiaMarchetti, beat: "Hardware, energy storage, deep tech" },
  { author: authors.helenaBrandt, beat: "Founders, exits and second acts" },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
      <header className="border-b border-rule py-12">
        <span className="kicker">About Us</span>
        <h1 className="headline mt-3 max-w-3xl text-[2.2rem] text-foreground sm:text-[3rem]">
          Independent reporting on the people who build companies, and the systems they have to
          work inside.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
          {siteName} is a digital publication covering business, technology and the startup
          ecosystem. We publish long-form features, desk reporting and analysis — the kind of work
          that takes more than a news cycle to get right.
        </p>
      </header>

      <section className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading title="What we cover" />
          <div className="space-y-6 text-[1.02rem] leading-[1.75] text-foreground/90">
            <p>
              Three desks, one shared assumption: that the most useful business story is usually
              about a decision somebody had to make with incomplete information. We report on the
              decision, the people who made it, and the consequences they did not plan for.
            </p>
            <p>
              We do not publish press releases as news, we do not accept payment for coverage, and
              we label sponsored content wherever it appears. Corrections are published on the same
              page as the original story and dated.
            </p>
            <p>
              Our features run between 2,000 and 6,000 words. Our analysis runs shorter. Both go
              through the same editing process, and both are answerable to the readers who pay for
              them.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <SectionHeading title="The newsroom" />
          <ul className="divide-y divide-rule">
            {newsroom.map((entry) => (
              <li key={entry.author.name} className="py-4">
                <p className="headline text-[1.12rem] text-foreground">{entry.author.name}</p>
                <p className="mt-1 text-[0.8rem] font-semibold tracking-[0.06em] text-brand uppercase">
                  {entry.author.title}
                </p>
                <p className="mt-1.5 text-[0.85rem] text-ink-soft">{entry.beat}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 border-t-2 border-foreground pt-8">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h2 className="headline text-[1.5rem] text-foreground">
              Have a story, a document, or a tip?
            </h2>
            <p className="mt-2 text-[0.95rem] text-ink-soft">
              We read everything that arrives, and we protect the people who send it.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 bg-foreground px-6 py-3 text-[0.8rem] font-semibold tracking-[0.06em] text-background uppercase transition-colors hover:bg-brand"
          >
            Contact the desk
          </Link>
        </div>
      </section>
    </div>
  );
}
