import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { siteName } from "@/data/content";
import logoBlack from "@/assets/forbes-logo-black.png";

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
        <Link to="/" className="inline-block" aria-label={`${siteName} home`}>
          <img
            src={logoBlack}
            alt={siteName}
            className="h-8 w-auto object-contain"
          />
        </Link>
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

export function AuthSubmit({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-foreground px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed"
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
