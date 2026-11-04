import { supabase } from "@/lib/supabase";

export type Status = "Published" | "In review" | "Draft";
export const statuses: Status[] = ["Published", "In review", "Draft"];

export interface ArticleRow {
  slug: string;
  title: string;
  deck: string;
  category: string;
  author: { name: string; title: string };
  author_id: string | null;
  author_email: string | null;
  published: string;
  published_at?: string;
  readTime: number;
  image: string;
  body: any[];
  views: number;
}

export function mapArticleRows(rows: any[]): ArticleRow[] {
  return rows.map((row: any) => ({
    slug: row.slug,
    title: row.title,
    deck: row.excerpt,
    category: row.category,
    author: { name: row.author, title: "Staff Writer" },
    author_id: row.author_id || null,
    author_email: row.author_email || null,
    published: new Date(row.published_at || Date.now()).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    published_at: row.published_at,
    readTime: parseInt(row.read_time) || 5,
    image: row.image_url,
    body: row.body,
    views: row.views || 0,
  }));
}

export function isStoryOwner(article: any, session: any, userFullName?: string): boolean {
  if (!session?.user) return false;
  const userId = session.user.id;
  const userEmail = (session.user.email || "").trim().toLowerCase();
  const emailPrefix = userEmail.split("@")[0].toLowerCase();
  const fullName = (userFullName || "").trim().toLowerCase();

  // 1. Direct author_id match
  if (article.author_id && article.author_id === userId) return true;

  // 2. Direct author_email match
  if (article.author_email && article.author_email.trim().toLowerCase() === userEmail) return true;

  // 3. String name or email prefix match
  const rawAuthor = (
    typeof article.author === "string"
      ? article.author
      : article.author?.name || ""
  ).trim().toLowerCase();

  if (rawAuthor) {
    if (rawAuthor === userEmail) return true;
    if (rawAuthor === emailPrefix) return true;
    if (fullName && rawAuthor === fullName) return true;
  }

  return false;
}

export async function getUserRoleAndApproval(userId: string, userEmail?: string) {
  const email = (userEmail || "").trim().toLowerCase();
  const isSuperAdmin = email === "forbesclone09@gmail.com";

  // 1. Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, is_approved, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  // 2. Fetch role fallback from user_roles
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const userIsAdmin = isSuperAdmin || roleData?.role === "admin" || profileData?.role === "admin";
  const role = userIsAdmin ? "admin" : (profileData?.role || roleData?.role || "author");
  const isApproved = userIsAdmin ? true : (profileData?.is_approved ?? false);

  const fullName = profileData?.full_name || "";

  return {
    isAdmin: userIsAdmin,
    role,
    isApproved,
    fullName,
  };
}
