import { createFileRoute } from "@tanstack/react-router";

import { SectionHeading } from "@/components/article-card";
import { siteName } from "@/data/content";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${siteName}` },
      {
        name: "description",
        content: `How ${siteName} collects, uses and protects your data across the site and newsletters.`,
      },
      { property: "og:title", content: `Privacy Policy — ${siteName}` },
      {
        property: "og:description",
        content: `How ${siteName} collects, uses and protects your data across the site and newsletters.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    heading: "What we collect",
    body: [
      "We collect the details you give us directly — your name and email address when you subscribe to a newsletter, create an account, or send a message through the contact form.",
      "We also collect standard technical information: pages visited, referring site, approximate region, and device type. This is aggregated and used to understand which reporting is read, not to identify individuals.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To deliver the newsletters and alerts you asked for, to respond to enquiries, and to measure the performance of our coverage so editors can make better decisions about what to commission.",
      "We do not sell personal data. We do not share your email address with advertisers. Where we work with a analytics or delivery provider, that provider processes data on our instructions and under contract.",
    ],
  },
  {
    heading: "Cookies and similar technology",
    body: [
      "We use a small number of strictly necessary cookies to keep you signed in and to remember your preferences. Optional analytics cookies are only set with your consent, and consent can be withdrawn at any time from the footer of every page.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "Every email we send carries a one-click unsubscribe link. You can ask us to confirm what we hold about you, correct it, or delete it by writing to privacy@forbes.de. We respond to requests within 30 days.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Newsletter subscriptions are kept until you unsubscribe, plus a short suppression list so a removed address is not accidentally re-added. Contact form messages are retained for two years so we can pick up a conversation where it was left.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If this policy changes materially, we say so on this page with a revised date and, where the change affects you directly, we email subscribers first.",
    ],
  },
];

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
      <header className="border-b border-rule py-12">
        <span className="kicker">Legal</span>
        <h1 className="headline mt-3 text-[2.2rem] text-foreground sm:text-[3rem]">
          Privacy Policy
        </h1>
        <p className="mt-5 text-[0.85rem] text-ink-soft">Last updated: 1 October 2026</p>
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
          Plain-language summary of what {siteName} does with your information. This is a
          demonstration document for a design mock-up, not legal advice.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <nav aria-label="Sections" className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="kicker">On this page</p>
            <ul className="mt-4 divide-y divide-rule border-t border-rule">
              {sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${section.heading.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block py-3 text-[0.9rem] text-ink-soft transition-colors hover:text-brand"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-8">
          {sections.map((section) => (
            <section
              key={section.heading}
              id={section.heading.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-32 border-b border-rule py-8 first:pt-0"
            >
              <SectionHeading title={section.heading} />
              <div className="space-y-4 text-[1.02rem] leading-[1.75] text-foreground/90">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <p className="pt-8 text-[0.85rem] text-ink-soft">
            Questions about this policy: privacy@forbes.de
          </p>
        </div>
      </div>
    </div>
  );
}
