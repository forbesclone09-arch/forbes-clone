import heroFeature from "@/assets/hero-feature.jpg";
import techAi from "@/assets/tech-ai.jpg";
import startupsSeed from "@/assets/startups-seed.jpg";
import businessWarehouse from "@/assets/business-warehouse.jpg";
import techChips from "@/assets/tech-chips.jpg";
import startupsBattery from "@/assets/startups-battery.jpg";
import businessFounder from "@/assets/business-founder.jpg";
import businessMarkets from "@/assets/business-markets.jpg";
import businessManufacturing from "@/assets/business-manufacturing.jpg";
import techCooling from "@/assets/tech-cooling.jpg";
import techRobotics from "@/assets/tech-robotics.jpg";
import businessCapital from "@/assets/business-capital.jpg";
import techSecurity from "@/assets/tech-security.jpg";
import techWearables from "@/assets/tech-wearables.jpg";

export type CategoryName = "Business" | "Tech" | "Startups";

export interface Author {
  name: string;
  title: string;
}

export interface Article {
  slug: string;
  title: string;
  deck: string;
  category: CategoryName;
  author: Author;
  published: string;
  readTime: number;
  image: string;
}

export const siteName = "Meridian";
export const siteTagline = "Business, Technology & the founders building what's next.";

export const navCategories: CategoryName[] = ["Business", "Tech", "Startups"];

export const authors = {
  nadiaRahman: { name: "Nadia Rahman", title: "Senior Correspondent, Global Commerce" },
  eliasVargas: { name: "Elias Vargas", title: "Technology Editor" },
  priyaAnand: { name: "Priya Anand", title: "Startups Columnist" },
  marcusWhitfield: { name: "Marcus Whitfield", title: "Staff Writer, Markets" },
  danielOkafor: { name: "Daniel Okafor", title: "Semiconductor Analyst" },
  sofiaMarchetti: { name: "Sofia Marchetti", title: "Hardware Reporter" },
  helenaBrandt: { name: "Helena Brandt", title: "Founders Editor" },
  averyChen: { name: "Avery Chen", title: "Markets Correspondent" },
  imaniBrooks: { name: "Imani Brooks", title: "Industry Reporter" },
  leoPark: { name: "Leo Park", title: "Technology Correspondent" },
  miraShah: { name: "Mira Shah", title: "Innovation Editor" },
} satisfies Record<string, Author>;

export const featuredArticle: Article = {
  slug: "quiet-rebuild-meridian-logistics",
  title:
    "The Quiet Rebuild: How Four Founders Turned a Stranded Cargo Ship Into a $2 Billion Company",
  deck:
    "When 40,000 orders sat rotting in a Rotterdam container yard, the founders of Meridian Logistics rewrote their own playbook. Eighteen months later, three of the world's largest retailers are copying it.",
  category: "Business",
  author: authors.nadiaRahman,
  published: "October 3, 2026",
  readTime: 12,
  image: heroFeature,
};

export const recentArticles: Article[] = [
  {
    slug: "enterprise-ai-budgets-pilots-to-payroll",
    title: "Enterprise AI Budgets Are Quietly Moving From Pilots to Payroll",
    deck:
      "Twelve large employers have stopped counting AI projects and started counting headcount.",
    category: "Tech",
    author: authors.eliasVargas,
    published: "October 2, 2026",
    readTime: 7,
    image: techAi,
  },
  {
    slug: "40-million-seed-round-nobody-asked-for",
    title: "The $40 Million Seed Round Nobody Asked For",
    deck:
      "Two engineers, one prototype, and a term sheet that arrived before the pitch deck.",
    category: "Startups",
    author: authors.priyaAnand,
    published: "October 2, 2026",
    readTime: 6,
    image: startupsSeed,
  },
  {
    slug: "warehouse-boom-reshaping-suburbs",
    title: "Inside the Warehouse Boom Reshaping America's Suburbs",
    deck:
      "Vacant malls are becoming distribution hubs. The tax fight that follows is only starting.",
    category: "Business",
    author: authors.marcusWhitfield,
    published: "October 1, 2026",
    readTime: 9,
    image: businessWarehouse,
  },
  {
    slug: "chip-wars-boring-expensive-phase",
    title: "Chip Wars Enter Their Boring, Expensive Phase",
    deck:
      "The subsidies are spent and the fabs are open. Now comes the part nobody marketed.",
    category: "Tech",
    author: authors.danielOkafor,
    published: "October 1, 2026",
    readTime: 8,
    image: techChips,
  },
  {
    slug: "battery-that-survived-9000-cycles",
    title: "Two Dropouts, One Factory, and a Battery That Survived 9,000 Cycles",
    deck:
      "A two-person team in Porto outlasted eleven funded rivals by skipping the prototype.",
    category: "Startups",
    author: authors.sofiaMarchetti,
    published: "September 30, 2026",
    readTime: 5,
    image: startupsBattery,
  },
  {
    slug: "founder-who-sold-twice-started-over-at-51",
    title: "The Founder Who Sold Twice and Started Over at 51",
    deck:
      "Two exits, a year of doing nothing, and a return to the same industry with a smaller idea.",
    category: "Business",
    author: authors.helenaBrandt,
    published: "September 30, 2026",
    readTime: 10,
    image: businessFounder,
  },
];

export const categoryFeatures: Article[] = [
  {
    slug: "regional-exchanges-new-wave-investors",
    title: "The Regional Exchanges Winning a New Wave of Investors",
    deck: "Smaller trading floors are finding a place in a market long dominated by the biggest names.",
    category: "Business",
    author: authors.averyChen,
    published: "September 29, 2026",
    readTime: 8,
    image: businessMarkets,
  },
  {
    slug: "manufacturing-founders-next-chapter",
    title: "The Founders Bringing Precision Manufacturing Back Home",
    deck: "A new generation of operators is betting that smaller factories can move faster.",
    category: "Business",
    author: authors.imaniBrooks,
    published: "September 28, 2026",
    readTime: 7,
    image: businessManufacturing,
  },
  {
    slug: "data-centers-cooling-rethink",
    title: "The Cooling Rethink Inside the Next Generation of Data Centers",
    deck: "The race for computing power is putting an overlooked piece of infrastructure in focus.",
    category: "Tech",
    author: authors.leoPark,
    published: "September 29, 2026",
    readTime: 6,
    image: techCooling,
  },
  {
    slug: "robotics-lab-factory-floor",
    title: "How Robotics Labs Are Finally Reaching the Factory Floor",
    deck: "Better sensors and simpler software are shortening the distance from prototype to production.",
    category: "Tech",
    author: authors.miraShah,
    published: "September 28, 2026",
    readTime: 9,
    image: techRobotics,
  },
  {
    slug: "private-capital-public-markets",
    title: "Why Private Capital Is Taking a Fresh Look at Public Markets",
    deck: "Patient investors are finding opportunity beyond the crowded deals of the past decade.",
    category: "Business",
    author: authors.averyChen,
    published: "October 6, 2026",
    readTime: 6,
    image: businessCapital,
  },
  {
    slug: "cybersecurity-next-investment-cycle",
    title: "Cybersecurity Is Becoming the Next Big Enterprise Investment",
    deck: "Security teams are moving from emergency spending to long-term infrastructure plans.",
    category: "Tech",
    author: authors.miraShah,
    published: "October 6, 2026",
    readTime: 7,
    image: techSecurity,
  },
  {
    slug: "wearables-smaller-bigger-business",
    title: "Smaller Wearables Are Building a Bigger Business",
    deck: "A new generation of health devices is turning quiet daily habits into a growing market.",
    category: "Tech",
    author: authors.leoPark,
    published: "October 5, 2026",
    readTime: 5,
    image: techWearables,
  },
];

export interface BriefItem {
  label: CategoryName;
  title: string;
  slug: string;
}

export const briefingItems: BriefItem[] = [
  {
    label: "Tech",
    title: "Open-source models are eating the stack",
    slug: "enterprise-ai-budgets-pilots-to-payroll",
  },
  {
    label: "Business",
    title: "Central banks are buying gold again",
    slug: "quiet-rebuild-meridian-logistics",
  },
  {
    label: "Startups",
    title: "The 18-month rule of Series A raises",
    slug: "40-million-seed-round-nobody-asked-for",
  },
];

export interface MostReadItem {
  rank: number;
  title: string;
  category: CategoryName;
  readTime: number;
  slug: string;
}

export const mostRead: MostReadItem[] = [
  {
    rank: 1,
    title: "The Middle Class Is Moving to Secondary Cities. Here's Where.",
    category: "Business",
    readTime: 6,
    slug: "warehouse-boom-reshaping-suburbs",
  },
  {
    rank: 2,
    title: "Central Banks Are Quietly Rewriting Their Gold Playbooks",
    category: "Business",
    readTime: 8,
    slug: "quiet-rebuild-meridian-logistics",
  },
  {
    rank: 3,
    title: "The 18-Month Rule Every Series A Founder Should Know",
    category: "Startups",
    readTime: 4,
    slug: "40-million-seed-round-nobody-asked-for",
  },
  {
    rank: 4,
    title: "Open-Source Models Are Eating the Enterprise Stack",
    category: "Tech",
    readTime: 7,
    slug: "enterprise-ai-budgets-pilots-to-payroll",
  },
  {
    rank: 5,
    title: "Why Insurance Giants Are Sudden Buyers of Climate Data",
    category: "Business",
    readTime: 9,
    slug: "chip-wars-boring-expensive-phase",
  },
  {
    rank: 6,
    title: "The Quiet Death of the Quarterly Earnings Call",
    category: "Business",
    readTime: 5,
    slug: "founder-who-sold-twice-started-over-at-51",
  },
];

export const allArticles: Article[] = [featuredArticle, ...recentArticles, ...categoryFeatures];

export function articlesByCategory(category: CategoryName): Article[] {
  return allArticles.filter((article) => article.category === category);
}
