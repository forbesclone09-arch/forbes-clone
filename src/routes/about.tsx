import { createFileRoute, Link } from "@tanstack/react-router";
import { siteName } from "@/data/content";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: `About Us — ${siteName}` },
      {
        name: "description",
        content: `Inspiring the conversations that lead to change. Learn about ${siteName}'s mission, solutions-focused journalism, events, and community.`,
      },
      { property: "og:title", content: `About Us — ${siteName}` },
      {
        property: "og:description",
        content: `Inspiring the conversations that lead to change. Learn about ${siteName}'s mission, solutions-focused journalism, events, and community.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="w-full bg-background text-foreground">
      {/* Full-width Hero Banner with aerial skyline */}
      <section className="relative h-[320px] sm:h-[400px] md:h-[440px] w-full overflow-hidden bg-black flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2000&q=80"
          alt="City skyline aerial view at night"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />
        <h1 className="relative z-10 font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white drop-shadow-sm">
          About us
        </h1>
      </section>

      {/* Main Content Article */}
      <article className="mx-auto max-w-[760px] px-6 py-16 sm:py-24">
        {/* Main Center Headline */}
        <h2 className="font-display text-[2.2rem] sm:text-[3rem] font-bold text-center leading-[1.18] text-foreground tracking-tight max-w-[640px] mx-auto">
          Inspiring the conversations that lead to change.
        </h2>

        {/* Small Coral Divider Line */}
        <div className="w-12 h-[2px] bg-brand mx-auto mt-7 mb-12 sm:mb-14" />

        {/* Editorial Body Content */}
        <div className="font-display text-[1.1rem] sm:text-[1.15rem] leading-[1.85] text-foreground/90 space-y-6">
          <p>
            For 100+ years, Forbes has championed entrepreneurial success by celebrating those who have made it and those who aspire to make it.
          </p>

          <p>
            The brand champions the most influential leaders and entrepreneurs who are driving change, transforming business and making a significant impact on the world.
          </p>

          <p>
            {siteName} is celebrating the greatest minds in business and tech, and highlighting research-driven thought leadership and success stories that ripple across the continent and the global stage.
          </p>

          <p>
            Together with our members and partners, we will reimagine what the media ecosystem can and should be, and deliver the platforms that help business leaders, global brands and audiences unite with inspiration for a greater future.
          </p>

          <h3 className="font-display text-[1.75rem] sm:text-[2rem] font-bold text-foreground pt-6 tracking-tight">
            Solutions-focused journalism
          </h3>

          <p>
            We will consistently pioneer new ways of engaging with the business community and not only report on the business landscape, we will create a platform that supports it. By tapping into in-depth analytical stories about success, determination, leadership and creativity that matter here, we will show the best and the brightest – from the established giants down to the up-and-comers in the fastest lanes.
          </p>

          <h3 className="font-display text-[1.75rem] sm:text-[2rem] font-bold text-foreground pt-6 tracking-tight">
            Live and virtual events
          </h3>

          <p>
            Throughout the year, {siteName} hosts dynamic and interactive events that bring the pages of the magazine to life and deliver thought leadership and practical insights for today’s business challenges.
          </p>

          {/* Quote Block */}
          <div className="my-8 border-l-[3px] border-brand pl-6 py-2">
            <blockquote className="font-display italic text-[1.15rem] sm:text-[1.25rem] text-foreground leading-relaxed">
              “Our attendees are among the most informed, influential business leaders, trailblazing entrepreneurs and inventive thinkers who are actively taking charge of shaping the future.”
            </blockquote>
          </div>

          <p>
            Whether it’s a summit for CEOs, CMOs and CIOs, an Under 30 event celebrating millennial ingenuity, or a flagship interaction with trailblazers, Forbes Live and Forbes Virtual create unforgettable experiences that connect communities and convey dynamism.
          </p>

          <h3 className="font-display text-[1.75rem] sm:text-[2rem] font-bold text-foreground pt-6 tracking-tight">
            A new membership experience
          </h3>

          <p>
            Step into the world of {siteName} with an Associate or Premium membership. Enjoy unlimited digital access to Forbes’ trusted journalism, preference regard to member only event opportunities, and much more. Explore {siteName}{" "}
            <Link to="/signup" className="text-brand font-semibold underline underline-offset-4 hover:text-brand/80">
              memberships
            </Link>
            .
          </p>
        </div>
      </article>
    </div>
  );
}
