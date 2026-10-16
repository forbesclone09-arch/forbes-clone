import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bold,
  Eye,
  FileText,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  PenLine,
  Plus,
  Quote,
  User,
  Users,
  MapPin,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

import { navCategories, siteName, type CategoryName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Author dashboard — ${siteName}` },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Manage your stories, drafts and readership in one place." },
    ],
  }),
  component: DashboardPage,
});

type Status = "Published" | "In review" | "Draft";
const statuses: Status[] = ["Published", "In review", "Draft"];

function DashboardPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>("user");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/login" });
      } else {
        setSession(session);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    // Fetch role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    const userRole = roleData?.role || "user";
    setRole(userRole);

    // Fetch articles
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
    
    // If not admin, maybe restrict to their own (for now, we'll just show all since auth isn't fully linking articles to authors yet)
    const { data: articlesData } = await query;
    if (articlesData) {
      const mapped = articlesData.map((row: any) => ({
        slug: row.slug,
        title: row.title,
        deck: row.excerpt,
        category: row.category,
        author: { name: row.author, title: "Staff Writer" },
        published: new Date(row.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        readTime: parseInt(row.read_time) || 5,
        image: row.image_url,
        body: row.body,
        views: row.views || 0,
      }));
      setArticles(mapped);
    }
    setLoading(false);
  };

  const rows = useMemo(
    () =>
      articles.map((article, i) => ({
        article,
        status: (i < 2 ? "Published" : statuses[i % 3]) as Status,
        views: article.views,
      })),
    [articles],
  );
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [tab, setTab] = useState<"stories" | "editor" | "profile" | "authors">("stories");
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const visible = rows.filter((r) => filter === "All" || r.status === filter);
  const totalViews = rows.reduce((s, r) => s + r.views, 0);

  const openEditor = (article: any = null) => {
    setActiveArticle(article);
    setTab("editor");
  };

  const handleEditorClose = () => {
    setTab("stories");
    setActiveArticle(null);
    fetchData(session?.user?.id); // Refresh after edit
  };

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  const dashboardTabs: any[] = [
    ["stories", "My stories", FileText],
    ["editor", "Editor", PenLine],
    ["profile", "Profile", User],
  ];
  if (role === "admin" || session?.user?.email === "forbesclone09@gmail.com") {
    dashboardTabs.push(["authors", "Authors", Users]); 
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-5">
        <div>
          <p className="kicker">Author dashboard {role === 'admin' && <span className="text-brand ml-2">(Admin Access)</span>}</p>
          <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem]">Welcome back, {session?.user?.email}</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
            className="text-[0.78rem] font-semibold tracking-[0.08em] text-ink-soft hover:text-foreground uppercase"
          >
            Sign out
          </button>
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[0.78rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
          >
            <Plus className="h-4 w-4" /> New story
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-rule lg:grid-cols-4">
        {[
          ["Published", rows.filter((r) => r.status === "Published").length],
          ["In review", rows.filter((r) => r.status === "In review").length],
          ["Drafts", rows.filter((r) => r.status === "Draft").length],
          ["Total views", totalViews.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="border-rule py-6 pr-4 odd:border-r lg:border-r lg:last:border-r-0 lg:px-6 lg:first:pl-0">
            <p className="kicker text-ink-soft">{label}</p>
            <p className="mt-2 font-display text-[2rem] leading-none">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-6 border-b border-rule">
        {dashboardTabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => key === "stories" ? handleEditorClose() : setTab(key)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-[0.88rem] font-semibold transition-colors ${
              tab === key ? "border-brand text-foreground" : "border-transparent text-ink-soft hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "stories" ? (
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {(["All", ...statuses] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`border px-3 py-1.5 text-[0.78rem] font-semibold transition-colors ${
                  filter === s ? "border-foreground bg-foreground text-background" : "border-rule text-ink-soft hover:border-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {visible.map(({ article, status, views }) => (
              <li key={article.slug} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <img src={article.image} alt="" className="h-16 w-24 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="kicker">{article.category}</p>
                  <Link
                    to="/article/$slug"
                    params={{ slug: article.slug }}
                    className="mt-1 block font-display text-[1.1rem] leading-snug hover:text-brand"
                  >
                    {article.title}
                  </Link>
                  <p className="mt-1 text-[0.8rem] text-ink-soft">
                    {article.author.name} · {article.published} · {article.readTime} min read
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[0.8rem]">
                  <span
                    className={`border px-2 py-1 font-semibold ${
                      status === "Published" ? "border-foreground" : status === "In review" ? "border-brand text-brand" : "border-rule text-ink-soft"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="inline-flex w-20 items-center gap-1 text-ink-soft">
                    <Eye className="h-3.5 w-3.5" /> {views ? views.toLocaleString() : "—"}
                  </span>
                  <button onClick={() => openEditor(article)} className="font-semibold hover:text-brand">
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : tab === "editor" ? (
        <Editor initialArticle={activeArticle} onClose={handleEditorClose} session={session} />
      ) : tab === "profile" ? (
        <ProfileManager session={session} />
      ) : (
        <AuthorsManager session={session} />
      )}
    </div>
  );
}

function ProfileManager({ session }: { session: any }) {
  const [profile, setProfile] = useState({
    full_name: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    role: "author",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || session.user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          bio: data.bio || "",
          role: data.role || "author",
        });
      } else {
        setProfile((prev) => ({
          ...prev,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
        }));
      }
      setLoading(false);
    }
    loadProfile();
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      email: session.user.email,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      bio: profile.bio,
      role: profile.role,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      setMessage({ text: `Failed to save: ${error.message}`, type: "error" });
    } else {
      setMessage({ text: "Profile details updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3500);
    }
  };

  if (loading) return <div className="p-8 text-center text-ink-soft">Loading profile...</div>;

  return (
    <section className="mt-8 max-w-3xl">
      <div className="border-b border-rule pb-5">
        <h2 className="headline text-[1.8rem]">Author Profile</h2>
        <p className="mt-1 text-[0.9rem] text-ink-soft">
          Manage your personal details, public bio, and contact information.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Full Name
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="e.g. Alex Weber"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="mt-2 w-full border border-rule bg-secondary/30 px-3.5 py-2.5 text-[0.95rem] text-ink-soft outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="e.g. +49 151 23456789"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
              City / Country
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="e.g. Berlin, Germany"
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
            Street Address
          </label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="e.g. Friedrichstraße 45, 10117"
            className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="block text-[0.8rem] font-semibold uppercase tracking-wider text-ink-soft">
            Bio / Contributor Note
          </label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Write a short biography that appears on your published stories..."
            className="mt-2 w-full border border-rule bg-background p-3.5 text-[0.95rem] leading-relaxed outline-none focus:border-foreground"
          />
        </div>

        {message && (
          <div
            className={`p-3 text-[0.85rem] font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-foreground px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AuthorsManager({ session }: { session: any }) {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    email: "",
    full_name: "",
    role: "author",
    phone: "",
    address: "",
    city: "",
    bio: "",
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadAuthors = async () => {
    setLoading(true);
    // 1. Try querying profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Query user_roles as well to make sure we don't miss anyone
    const { data: rolesData } = await supabase.from("user_roles").select("*");

    if (profilesData && profilesData.length > 0) {
      const profileUserIds = new Set(profilesData.map((p: any) => p.id));
      const extraAuthors = (rolesData || [])
        .filter((r: any) => !profileUserIds.has(r.user_id))
        .map((r: any) => ({
          id: r.user_id,
          email: r.user_id,
          full_name: "Author",
          role: r.role,
        }));
      setAuthors([...profilesData, ...extraAuthors]);
    } else if (rolesData) {
      setAuthors(
        rolesData.map((r: any) => ({
          id: r.user_id,
          email: r.user_id,
          full_name: "Author",
          role: r.role,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleSaveAuthorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
    setModalSaving(true);
    setErrorMsg("");

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: editingAuthor.id,
      email: editingAuthor.email,
      full_name: editingAuthor.full_name,
      role: editingAuthor.role,
      phone: editingAuthor.phone,
      address: editingAuthor.address,
      city: editingAuthor.city,
      bio: editingAuthor.bio,
      updated_at: new Date().toISOString(),
    });

    await supabase.from("user_roles").upsert({
      user_id: editingAuthor.id,
      role: editingAuthor.role,
    });

    setModalSaving(false);
    if (profileError) {
      setErrorMsg(profileError.message);
    } else {
      setEditingAuthor(null);
      loadAuthors();
    }
  };

  const handleAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSaving(true);
    setErrorMsg("");

    const newId = crypto.randomUUID();
    const { error: profileError } = await supabase.from("profiles").insert({
      id: newId,
      email: newAuthor.email,
      full_name: newAuthor.full_name,
      role: newAuthor.role,
      phone: newAuthor.phone,
      address: newAuthor.address,
      city: newAuthor.city,
      bio: newAuthor.bio,
    });

    setModalSaving(false);
    if (profileError) {
      setErrorMsg(profileError.message);
    } else {
      setShowAddModal(false);
      setNewAuthor({
        email: "",
        full_name: "",
        role: "author",
        phone: "",
        address: "",
        city: "",
        bio: "",
      });
      loadAuthors();
    }
  };

  const handleRemoveAuthor = async (author: any) => {
    if (!confirm(`Are you sure you want to remove author ${author.full_name || author.email}?`)) {
      return;
    }
    await supabase.from("profiles").delete().eq("id", author.id);
    await supabase.from("user_roles").update({ role: "user" }).eq("user_id", author.id);
    loadAuthors();
  };

  if (loading) return <div className="mt-6 p-4 text-ink-soft">Loading authors...</div>;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="headline text-[1.8rem]">Manage Authors</h2>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            View, edit roles, contact details, and manage system authors.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg("");
            setShowAddModal(true);
          }}
          className="bg-foreground text-background px-4 py-2.5 text-[0.8rem] font-semibold uppercase hover:bg-brand transition-colors"
        >
          + Add Author
        </button>
      </div>

      <div className="border border-rule overflow-x-auto">
        <table className="w-full text-left text-[0.9rem] min-w-[650px]">
          <thead className="bg-secondary/50 border-b border-rule">
            <tr>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Author</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Role</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem]">Contact</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.75rem] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-secondary/20">
                <td className="py-4 px-4">
                  <div className="font-semibold text-foreground">{author.full_name || "Author"}</div>
                  <div className="text-[0.8rem] text-ink-soft">{author.email}</div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-wider border ${
                      author.role === "admin"
                        ? "border-brand text-brand bg-brand/5"
                        : "border-rule text-ink-soft"
                    }`}
                  >
                    {author.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-ink-soft text-[0.82rem]">
                  {author.phone && <div>{author.phone}</div>}
                  {author.city && <div className="text-[0.75rem] text-ink-soft/80">{author.city}</div>}
                  {!author.phone && !author.city && <span className="text-ink-soft/50">—</span>}
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setEditingAuthor({ ...author });
                    }}
                    className="text-[0.8rem] font-semibold text-foreground hover:text-brand mr-4"
                  >
                    Edit Details
                  </button>
                  {author.role !== "admin" && (
                    <button
                      onClick={() => handleRemoveAuthor(author)}
                      className="text-[0.8rem] font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Details Modal */}
      {editingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-[1.4rem] text-foreground">Edit Author Details</h3>
            <p className="mt-1 text-[0.85rem] text-ink-soft">
              Update role, contact details, or profile information for {editingAuthor.email}.
            </p>

            <form onSubmit={handleSaveAuthorEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Full Name</label>
                <input
                  type="text"
                  value={editingAuthor.full_name || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, full_name: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Role</label>
                <select
                  value={editingAuthor.role || "author"}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                >
                  <option value="author">Author</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={editingAuthor.phone || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={editingAuthor.city || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Address</label>
                <input
                  type="text"
                  value={editingAuthor.address || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, address: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Bio</label>
                <textarea
                  rows={3}
                  value={editingAuthor.bio || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background p-2.5 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setEditingAuthor(null)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
                >
                  {modalSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Author Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-[1.4rem] text-foreground">Add New Author</h3>
            <p className="mt-1 text-[0.85rem] text-ink-soft">
              Create an author profile in the system.
            </p>

            <form onSubmit={handleAddAuthor} className="mt-5 space-y-4">
              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Author Email*</label>
                <input
                  type="email"
                  required
                  value={newAuthor.email}
                  onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
                  placeholder="author@example.com"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Full Name*</label>
                <input
                  type="text"
                  required
                  value={newAuthor.full_name}
                  onChange={(e) => setNewAuthor({ ...newAuthor, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Role</label>
                <select
                  value={newAuthor.role}
                  onChange={(e) => setNewAuthor({ ...newAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                >
                  <option value="author">Author</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={newAuthor.phone}
                    onChange={(e) => setNewAuthor({ ...newAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={newAuthor.city}
                    onChange={(e) => setNewAuthor({ ...newAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand disabled:opacity-50"
                >
                  {modalSaving ? "Adding..." : "Add Author"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function Editor({ initialArticle, onClose, session }: { initialArticle: any, onClose: () => void, session: any }) {
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.deck || "");
  const [category, setCategory] = useState(initialArticle?.category || "Business");
  // Handle content body. Store as simple text for MVP, parse back into JSON array on save.
  const initialBodyText = initialArticle?.body 
    ? initialArticle.body.map((b: any) => b.content).join("\n\n") 
    : "";
  const [content, setContent] = useState(initialBodyText);
  const [saved, setSaved] = useState("");
  const tools = [Bold, Italic, Heading2, Quote, List, ListOrdered, Link2, ImagePlus];

  const handleSave = async () => {
    setSaved("Saving...");
    const slug = initialArticle?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const paragraphs = content.split("\n\n").map(p => ({ type: "paragraph", content: p }));
    
    const articleData = {
      slug,
      title,
      excerpt,
      category,
      body: paragraphs,
      image_url: initialArticle?.image || "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80",
      image_alt: "Article Image",
      author: session?.user?.email?.split('@')[0] || "Unknown",
      read_time: "5 min read",
      published_at: initialArticle?.published_at || new Date().toISOString(),
      is_premium: false
    };

    const { error } = await supabase.from('articles').upsert(articleData, { onConflict: 'slug' });
    
    if (error) {
      setSaved(`Error: ${error.message}`);
    } else {
      setSaved("Successfully saved to Supabase!");
      setTimeout(() => onClose(), 1500);
    }
  };

  const [categories, setCategories] = useState<string[]>(() => {
    const defaultCats = [...navCategories];
    if (initialArticle?.category && !defaultCats.includes(initialArticle.category)) {
      defaultCats.push(initialArticle.category);
    }
    return defaultCats;
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  return (
    <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          className="w-full border-b border-rule bg-transparent pb-3 font-display text-[2rem] leading-tight outline-none placeholder:text-ink-soft focus:border-foreground"
        />
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Standfirst — one or two sentences that sell the story"
          className="mt-4 w-full bg-transparent text-[1.05rem] text-ink-soft outline-none"
        />
        <div className="mt-6 flex flex-wrap border border-rule">
          {tools.map((Icon, i) => (
            <button
              key={i}
              type="button"
              aria-label="Formatting tool"
              className="grid h-10 w-10 place-items-center border-r border-rule text-ink-soft hover:bg-secondary hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your story... (separate paragraphs by pressing Enter twice) Supports HTML."
          className="min-h-[360px] w-full resize-y border border-t-0 border-rule bg-transparent p-5 text-[1.02rem] leading-relaxed outline-none focus:border-foreground"
        />
      </div>

      <aside className="space-y-6">
        <div className="border-t-2 border-foreground pt-4">
          <p className="kicker">Publishing</p>
          <label className="mt-4 block text-[0.8rem] font-semibold">
            Category
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === "__NEW__") {
                  setShowCategoryModal(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              className="mt-2 w-full border border-rule bg-background px-3 py-2.5 font-normal outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__NEW__" className="font-semibold text-brand">
                + Create a new category...
              </option>
            </select>
          </label>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={handleSave}
              className="border border-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] uppercase hover:bg-secondary"
            >
              Save
            </button>
            <button
              onClick={() => onClose()}
              className="bg-foreground px-3 py-2.5 text-[0.75rem] font-semibold tracking-[0.06em] text-background uppercase hover:bg-brand"
            >
              Cancel
            </button>
          </div>
          {saved && <p className={`mt-3 border-l-2 pl-3 text-[0.8rem] ${saved.includes('Error') ? 'border-red-500 text-red-500' : 'border-brand text-brand'}`}>{saved}</p>}
        </div>

        {/* Modal for creating a new category */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md border border-rule bg-background p-6 shadow-xl">
              <h3 className="font-display text-[1.4rem] text-foreground">Create New Category</h3>
              <p className="mt-1 text-[0.85rem] text-ink-soft">Enter the name of the new category you want to add.</p>
              <form onSubmit={handleCreateCategory} className="mt-4">
                <input
                  type="text"
                  autoFocus
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full border border-rule bg-background px-3 py-2 text-[0.9rem] outline-none focus:border-foreground"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategoryName("");
                    }}
                    className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-foreground px-4 py-2 text-[0.75rem] font-semibold uppercase text-background hover:bg-brand"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="border-t border-rule pt-4">
          <p className="kicker">Cover image</p>
          <div className="mt-3 grid aspect-[4/3] place-items-center border border-dashed border-rule text-[0.8rem] text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4" /> Drop an image
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
