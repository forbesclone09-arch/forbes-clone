import type { ReactNode } from "react";

import { siteName } from "@/data/content";

export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pb-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col py-16">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center bg-foreground font-display text-[1.05rem] leading-none text-background"
          >
            M
          </span>
          <span className="font-display text-2xl leading-none font-semibold tracking-tight">
            {siteName}
          </span>
        </div>
        <h1 className="headline mt-8 text-[2.1rem] text-foreground sm:text-[2.5rem]">{title}</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{intro}</p>
        {children}
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input
        required
        type={type}
        value={value}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-rule bg-background px-4 py-3.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

export function AuthSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full bg-foreground px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
    >
      {children}
    </button>
  );
}

export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 border-l-2 border-brand py-1 pl-4 text-[0.85rem] leading-relaxed text-ink-soft">
      {children}
    </p>
  );
}

export const authLinkClass =
  "font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline";

export function authHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — ${siteName}` },
      { name: "robots", content: "noindex" },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — ${siteName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
