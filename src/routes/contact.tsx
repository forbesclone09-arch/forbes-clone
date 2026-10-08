import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { SectionHeading } from "@/components/article-card";
import { siteName } from "@/data/content";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `Contact — ${siteName}` },
      {
        name: "description",
        content: `Reach the ${siteName} newsroom: story tips, editorial enquiries, press and permissions.`,
      },
      { property: "og:title", content: `Contact — ${siteName}` },
      {
        property: "og:description",
        content: `Reach the ${siteName} newsroom: story tips, editorial enquiries, press and permissions.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const desks = [
  {
    label: "Story tips",
    detail: "tips@meridian.example",
    note: "Encrypted submissions welcome. We do not publish the identity of a source without written consent.",
  },
  {
    label: "Editorial",
    detail: "editor@meridian.example",
    note: "Corrections, clarifications and pitches to the features desk.",
  },
  {
    label: "Press & permissions",
    detail: "permissions@meridian.example",
    note: "Reprints, syndication, interview requests and media enquiries.",
  },
  {
    label: "Commercial",
    detail: "partners@meridian.example",
    note: "Sponsored content and brand partnerships. Commercial deals never influence coverage.",
  },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "Story tip", message: "" });

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
      <header className="border-b border-rule py-12">
        <span className="kicker">Contact</span>
        <h1 className="headline mt-3 max-w-3xl text-[2.2rem] text-foreground sm:text-[3rem]">
          Tell us something we should be looking at.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
          Every message reaches a person on the desk that covers it. Response times vary, but
          nothing sent here is auto-filed.
        </p>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading title="The desks" />
          <ul className="divide-y divide-rule">
            {desks.map((desk) => (
              <li key={desk.label} className="py-5 first:pt-0">
                <p className="kicker">{desk.label}</p>
                <p className="headline mt-2 text-[1.15rem] text-foreground">{desk.detail}</p>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">{desk.note}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-rule pt-5 text-[0.85rem] text-ink-soft">
            <p className="font-semibold text-foreground">{siteName} Media Group</p>
            <p className="mt-1">14 Harbour Row, Suite 500</p>
            <p>Rotterdam, 3011 AL, Netherlands</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <SectionHeading title="Send a message" />

          {sent ? (
            <div className="border-2 border-foreground p-8">
              <h2 className="headline text-[1.6rem] text-foreground">Message received</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                Thanks, {form.name || "there"} — your note about &ldquo;{form.subject.toLowerCase()}
                &rdquo; is with the desk. This is a demonstration interface, so nothing was actually
                transmitted.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", subject: "Story tip", message: "" });
                }}
                className="mt-6 inline-flex bg-foreground px-5 py-2.5 text-[0.8rem] font-semibold tracking-[0.06em] text-background uppercase transition-colors hover:bg-brand"
              >
                Write another
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="kicker">Your name</span>
                  <input
                    required
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Jordan Ellis"
                    className="mt-2 w-full border border-rule bg-background px-4 py-3 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="kicker">Email</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@company.com"
                    className="mt-2 w-full border border-rule bg-background px-4 py-3 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </label>
              </div>

              <label className="block">
                <span className="kicker">Subject</span>
                <select
                  value={form.subject}
                  onChange={update("subject")}
                  className="mt-2 w-full border border-rule bg-background px-4 py-3 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
                >
                  <option>Story tip</option>
                  <option>Correction</option>
                  <option>Pitch to the features desk</option>
                  <option>Press and permissions</option>
                  <option>Commercial enquiry</option>
                </select>
              </label>

              <label className="block">
                <span className="kicker">Message</span>
                <textarea
                  required
                  rows={7}
                  value={form.message}
                  onChange={update("message")}
                  placeholder="What should we be looking at, and why now?"
                  className="mt-2 w-full resize-y border border-rule bg-background px-4 py-3 text-[0.95rem] leading-relaxed text-foreground outline-none transition-colors focus:border-foreground"
                />
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  className="inline-flex bg-foreground px-7 py-3 text-[0.8rem] font-semibold tracking-[0.06em] text-background uppercase transition-colors hover:bg-brand"
                >
                  Send message
                </button>
                <p className="text-[0.78rem] text-ink-soft">
                  Demonstration form &mdash; no backend is connected.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
