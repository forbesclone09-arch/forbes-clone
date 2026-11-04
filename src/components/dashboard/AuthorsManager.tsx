import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Shield,
  Check,
  Clock,
  Loader2,
  Copy,
  AlertCircle,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AuthorsManager({
  session,
  onPendingChange,
}: {
  session: any;
  onPendingChange?: (count: number) => void;
}) {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [roleModalAuthor, setRoleModalAuthor] = useState<any>(null);
  const [roleModalSelectedRole, setRoleModalSelectedRole] = useState<string>("author");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [provisionedCredentials, setProvisionedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
    role: string;
  } | null>(null);
  const [newAuthor, setNewAuthor] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "author",
    phone: "",
    address: "",
    city: "",
    bio: "",
    is_approved: true,
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAuthor((prev) => ({ ...prev, password: pwd }));
  };

  const loadAuthors = async () => {
    setLoading(true);
    // 1. Try querying profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Query user_roles as well to make sure we don't miss anyone
    const { data: rolesData } = await supabase.from("user_roles").select("*");

    let allAuthors: any[] = [];
    if (profilesData && profilesData.length > 0) {
      const profileUserIds = new Set(profilesData.map((p: any) => p.id));
      const extraAuthors = (rolesData || [])
        .filter((r: any) => !profileUserIds.has(r.user_id))
        .map((r: any) => ({
          id: r.user_id,
          email: r.user_id,
          full_name: "Author",
          role: r.role,
          is_approved: r.role === "admin" || r.user_id === session?.user?.id,
        }));
      allAuthors = [...profilesData, ...extraAuthors];
    } else if (rolesData) {
      allAuthors = rolesData.map((r: any) => ({
        id: r.user_id,
        email: r.user_id,
        full_name: "Author",
        role: r.role,
        is_approved: r.role === "admin" || r.user_id === session?.user?.id,
      }));
    }

    setAuthors(allAuthors);
    const unapprovedCount = allAuthors.filter(
      (a) => !a.is_approved && a.email !== "forbesclone09@gmail.com"
    ).length;
    if (onPendingChange) onPendingChange(unapprovedCount);
    setLoading(false);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleRoleChange = async (author: any, newRole: string) => {
    if (author.email === "forbesclone09@gmail.com" && newRole !== "admin") {
      alert("The primary super administrator account cannot be demoted.");
      return;
    }

    setUpdatingRoleId(author.id);
    setActionFeedback(null);

    try {
      const updatePayload: any = {
        role: newRole,
        updated_at: new Date().toISOString(),
      };
      if (newRole === "admin") {
        updatePayload.is_approved = true;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", author.id);

      if (profileError) throw profileError;

      // Sync user_roles table
      await supabase
        .from("user_roles")
        .upsert({
          user_id: author.id,
          role: newRole,
        });

      // Update state locally
      setAuthors((prev) =>
        prev.map((a) =>
          a.id === author.id
            ? { ...a, role: newRole, is_approved: newRole === "admin" ? true : a.is_approved }
            : a
        )
      );

      setActionFeedback({
        text: `Role for ${author.full_name || author.email} updated to ${newRole.toUpperCase()} successfully.`,
        type: "success",
      });
      setTimeout(() => setActionFeedback(null), 4000);
      setRoleModalAuthor(null);
    } catch (err: any) {
      setActionFeedback({
        text: `Failed to update role: ${err.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleApproveAuthor = async (author: any) => {
    setModalSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("id", author.id);

    setModalSaving(false);
    if (error) {
      alert(`Error approving author: ${error.message}`);
    } else {
      loadAuthors();
    }
  };

  const handleRevokeAuthor = async (author: any) => {
    if (
      !confirm(
        `Are you sure you want to suspend or revoke dashboard access for ${
          author.full_name || author.email
        }? They will no longer be able to access the author dashboard.`
      )
    ) {
      return;
    }
    setModalSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq("id", author.id);

    setModalSaving(false);
    if (error) {
      alert(`Error updating author: ${error.message}`);
    } else {
      loadAuthors();
    }
  };

  const handleSaveAuthorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
    setModalSaving(true);
    setErrorMsg("");

    const isAppr =
      editingAuthor.is_approved === true ||
      editingAuthor.is_approved === "true" ||
      editingAuthor.role === "admin" ||
      editingAuthor.email === "forbesclone09@gmail.com";

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: editingAuthor.id,
      email: editingAuthor.email,
      full_name: editingAuthor.full_name,
      role: editingAuthor.role,
      phone: editingAuthor.phone,
      address: editingAuthor.address,
      city: editingAuthor.city,
      bio: editingAuthor.bio,
      is_approved: isAppr,
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
    if (!newAuthor.password || newAuthor.password.length < 6) {
      setErrorMsg("Please provide an initial password of at least 6 characters.");
      return;
    }
    setModalSaving(true);
    setErrorMsg("");

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dzcrxsltiatmqhookcvr.supabase.co";
      const supabaseAnonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Y3J4c2x0aWF0bXFob29rY3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDI4NzYsImV4cCI6MjEwNzExODg3Nn0.hfrTD27AG4L_gYbY3ij0nejDflZVOu8m-U-tcnLRvOY";

      // Isolated Supabase client to prevent replacing the active admin session
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: newAuthor.email.trim(),
        password: newAuthor.password,
        options: {
          data: {
            full_name: newAuthor.full_name.trim(),
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const newId = authData.user?.id || crypto.randomUUID();

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: newId,
        email: newAuthor.email.trim(),
        full_name: newAuthor.full_name.trim(),
        role: newAuthor.role,
        phone: newAuthor.phone,
        address: newAuthor.address,
        city: newAuthor.city,
        bio: newAuthor.bio,
        is_approved: true,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      await supabase.from("user_roles").upsert({
        user_id: newId,
        role: newAuthor.role,
      });

      setProvisionedCredentials({
        email: newAuthor.email.trim(),
        password: newAuthor.password,
        name: newAuthor.full_name.trim(),
        role: newAuthor.role,
      });

      setShowAddModal(false);
      setNewAuthor({
        email: "",
        password: "",
        full_name: "",
        role: "author",
        phone: "",
        address: "",
        city: "",
        bio: "",
        is_approved: true,
      });
      await loadAuthors();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create journalist account.");
    } finally {
      setModalSaving(false);
    }
  };

  const handleRemoveAuthor = async (author: any) => {
    if (author.email === "forbesclone09@gmail.com") {
      alert("The primary super administrator account cannot be removed.");
      return;
    }
    if (author.id === session?.user?.id) {
      alert("You cannot remove your own active administrator account.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove journalist ${
        author.full_name || author.email
      }?\n\nThis will revoke their newsroom access and delete their contributor profile.`
    );
    if (!confirmed) return;

    try {
      await supabase.from("profiles").delete().eq("id", author.id);
      await supabase.from("user_roles").delete().eq("user_id", author.id);
      setAuthors((prev) => prev.filter((a) => a.id !== author.id));
      setActionFeedback({
        text: `Journalist ${author.full_name || author.email} has been removed.`,
        type: "success",
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error removing journalist: ${err.message || "Unknown error"}`);
    }
  };

  const pendingAuthors = authors.filter(
    (a) => !a.is_approved && a.email !== "forbesclone09@gmail.com"
  );
  const approvedAuthors = authors.filter(
    (a) => a.is_approved || a.email === "forbesclone09@gmail.com"
  );

  const filteredAuthors = authors.filter((a) => {
    if (statusFilter === "pending") return !a.is_approved && a.email !== "forbesclone09@gmail.com";
    if (statusFilter === "approved") return a.is_approved || a.email === "forbesclone09@gmail.com";
    return true;
  });

  if (loading) return <div className="mt-6 p-4 text-ink-soft">Loading team and authors...</div>;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="headline text-[1.6rem] text-foreground">Journalists & Editorial Team</h2>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Manage newsroom staff, author approvals, permissions, and provision new journalist login credentials.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Journalist
        </button>
      </div>

      {actionFeedback && (
        <div
          className={`mb-6 p-3 text-[0.85rem] font-medium border rounded flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{actionFeedback.text}</span>
          <button onClick={() => setActionFeedback(null)} className="text-xs uppercase font-bold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {pendingAuthors.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/10 p-4 text-[0.88rem] text-amber-900 rounded-lg">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingAuthors.length} author application(s)</strong> awaiting administrator approval.
            </span>
          </div>
          {statusFilter !== "pending" && (
            <button
              onClick={() => setStatusFilter("pending")}
              className="text-[0.78rem] font-bold uppercase tracking-wider text-amber-800 underline hover:text-amber-950"
            >
              Filter Pending Only &rarr;
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border rounded transition-colors ${
            statusFilter === "all"
              ? "border-zinc-950 bg-zinc-950 text-white"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          All ({authors.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border rounded transition-colors ${
            statusFilter === "pending"
              ? "border-amber-600 bg-amber-600 text-white"
              : pendingAuthors.length > 0
              ? "border-amber-500/40 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Pending ({pendingAuthors.length})
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-3 py-1.5 text-[0.75rem] font-semibold uppercase tracking-wider border rounded transition-colors ${
            statusFilter === "approved"
              ? "border-zinc-950 bg-zinc-950 text-white"
              : "border-rule text-ink-soft hover:bg-secondary"
          }`}
        >
          Approved ({approvedAuthors.length})
        </button>
      </div>

      <div className="border border-rule rounded-lg overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-[0.88rem] min-w-[760px]">
          <thead className="bg-zinc-50 border-b border-rule">
            <tr>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.72rem]">Author</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.72rem]">Role (Assign)</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.72rem]">Status</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.72rem]">Contact</th>
              <th className="py-3 px-4 font-semibold text-ink-soft uppercase tracking-wider text-[0.72rem] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {filteredAuthors.map((author) => {
              const isAppr = author.email === "forbesclone09@gmail.com" || author.is_approved;
              const isSuper = author.email === "forbesclone09@gmail.com";
              return (
                <tr key={author.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {author.full_name || "Author"}
                      {author.role === "admin" && (
                        <Shield className="h-3.5 w-3.5 text-red-600" title="Administrator" />
                      )}
                    </div>
                    <div className="text-[0.78rem] text-ink-soft">{author.email}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={author.role || "author"}
                        disabled={updatingRoleId === author.id || isSuper}
                        onChange={(e) => handleRoleChange(author, e.target.value)}
                        className={`text-[0.72rem] font-bold uppercase tracking-wider border px-2 py-1 bg-background rounded cursor-pointer outline-none transition-colors ${
                          author.role === "admin"
                            ? "border-red-500 text-red-600 bg-red-50 focus:border-red-600 font-extrabold"
                            : author.role === "author"
                            ? "border-zinc-300 text-zinc-900 focus:border-zinc-800"
                            : "border-rule text-ink-soft focus:border-foreground"
                        } ${isSuper ? "cursor-not-allowed opacity-80" : ""}`}
                        title={isSuper ? "Primary administrator role cannot be altered" : "Assign new role to this user"}
                      >
                        <option value="admin">Admin</option>
                        <option value="author">Author</option>
                        <option value="contributor">Contributor</option>
                        <option value="user">User</option>
                      </select>
                      {updatingRoleId === author.id && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isAppr ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider rounded border border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                        <Check className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider rounded border border-amber-500/40 text-amber-700 bg-amber-500/15">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-ink-soft text-[0.8rem]">
                    {author.phone && <div>{author.phone}</div>}
                    {author.city && <div className="text-[0.72rem] text-ink-soft/80">{author.city}</div>}
                    {!author.phone && !author.city && <span className="text-ink-soft/50">—</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {!isSuper && !isAppr && (
                      <button
                        onClick={() => handleApproveAuthor(author)}
                        className="bg-emerald-600 text-white px-2.5 py-1 text-[0.72rem] font-semibold uppercase hover:bg-emerald-700 mr-2 transition-colors rounded"
                      >
                        Approve
                      </button>
                    )}
                    {!isSuper && isAppr && (
                      <button
                        onClick={() => handleRevokeAuthor(author)}
                        className="text-[0.75rem] font-semibold text-amber-700 hover:text-amber-900 hover:underline mr-3"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRoleModalAuthor({ ...author });
                        setRoleModalSelectedRole(author.role || "author");
                      }}
                      className="text-[0.78rem] font-semibold text-red-600 hover:underline mr-3"
                    >
                      Assign Role
                    </button>
                    <button
                      onClick={() => {
                        setErrorMsg("");
                        setEditingAuthor({ ...author });
                      }}
                      className="text-[0.78rem] font-semibold text-foreground hover:text-red-600 mr-3"
                    >
                      Edit Details
                    </button>
                    {!isSuper && author.id !== session?.user?.id && (
                      <button
                        onClick={() => handleRemoveAuthor(author)}
                        className="text-[0.78rem] font-semibold text-red-600 hover:text-red-800 transition-colors"
                        title="Remove journalist from newsroom"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dedicated Assign Role Modal */}
      {roleModalAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="flex items-center gap-2 border-b border-rule pb-3">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="font-display text-[1.3rem] text-foreground">
                Assign Role to {roleModalAuthor.full_name || roleModalAuthor.email}
              </h3>
            </div>
            <p className="mt-2 text-[0.82rem] text-ink-soft">
              Select a permission level below. Administrators can edit all stories, approve contributors, and assign roles to others.
            </p>

            <div className="mt-4 space-y-2.5">
              {[
                {
                  id: "admin",
                  name: "Administrator",
                  badge: "Full Access",
                  desc: "Can edit all stories across newsroom, approve or suspend authors, assign roles, and manage site settings.",
                },
                {
                  id: "author",
                  name: "Author",
                  badge: "Standard Access",
                  desc: "Can write, draft, pitch, and publish stories. Can edit their own stories and customize their profile.",
                },
                {
                  id: "contributor",
                  name: "Contributor",
                  badge: "Guest Writer",
                  desc: "Can submit draft articles for review and manage their personal drafts.",
                },
                {
                  id: "user",
                  name: "Reader / User",
                  badge: "Subscriber",
                  desc: "Standard subscriber account. Does not have access to author dashboard or publication tools.",
                },
              ].map((r) => (
                <label
                  key={r.id}
                  onClick={() => setRoleModalSelectedRole(r.id)}
                  className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    roleModalSelectedRole === r.id
                      ? "border-red-600 bg-red-50/50"
                      : "border-rule bg-background hover:bg-secondary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="roleOption"
                    value={r.id}
                    checked={roleModalSelectedRole === r.id}
                    onChange={() => setRoleModalSelectedRole(r.id)}
                    className="mt-1 accent-red-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[0.88rem]">{r.name}</span>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 border border-rule bg-secondary/50 rounded">
                        {r.badge}
                      </span>
                    </div>
                    <p className="text-[0.76rem] text-ink-soft mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-rule">
              <button
                type="button"
                onClick={() => setRoleModalAuthor(null)}
                className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingRoleId === roleModalAuthor.id}
                onClick={() => handleRoleChange(roleModalAuthor, roleModalSelectedRole)}
                className="bg-red-600 px-5 py-2 text-[0.75rem] font-semibold uppercase text-white hover:bg-red-500 disabled:opacity-50 rounded transition-colors"
              >
                {updatingRoleId === roleModalAuthor.id ? "Assigning..." : "Confirm Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto rounded-lg">
            <h3 className="font-display text-[1.3rem] text-foreground">Edit Author Details</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">
              Update role, approval status, contact details, or profile information for {editingAuthor.email}.
            </p>

            <form onSubmit={handleSaveAuthorEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Full Name</label>
                <input
                  type="text"
                  value={editingAuthor.full_name || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, full_name: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Role (Assign)</label>
                <select
                  value={editingAuthor.role || "author"}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                >
                  <option value="admin">Admin (Full access to all stories & author management)</option>
                  <option value="author">Author (Standard story writing & personal editing)</option>
                  <option value="contributor">Contributor (Draft submissions)</option>
                  <option value="user">User (Reader account)</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Dashboard Access / Status</label>
                <select
                  value={editingAuthor.is_approved ? "true" : "false"}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, is_approved: e.target.value === "true" })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                >
                  <option value="true">Approved (Active Dashboard Access)</option>
                  <option value="false">Pending Approval (Restricted)</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={editingAuthor.phone || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                  />
                </div>
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={editingAuthor.city || ""}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Address</label>
                <input
                  type="text"
                  value={editingAuthor.address || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, address: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Bio</label>
                <textarea
                  rows={3}
                  value={editingAuthor.bio || ""}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background p-2.5 text-[0.88rem] outline-none focus:border-foreground rounded"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setEditingAuthor(null)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-red-600 px-4 py-2 text-[0.75rem] font-semibold uppercase text-white hover:bg-red-500 disabled:opacity-50 rounded"
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
          <div className="w-full max-w-lg border border-rule bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto rounded-lg">
            <h3 className="font-display text-[1.3rem] text-foreground">Add New Journalist</h3>
            <p className="mt-1 text-[0.82rem] text-ink-soft">
              Provision an official newsroom author account with unique credentials and custom role permissions.
            </p>

            <form onSubmit={handleAddAuthor} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Journalist Email*</label>
                <input
                  type="email"
                  required
                  value={newAuthor.email}
                  onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
                  placeholder="journalist@forbes.com"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">
                    Initial Password*
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[0.68rem] font-bold text-red-600 hover:underline"
                  >
                    Auto-Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newAuthor.password}
                  onChange={(e) => setNewAuthor({ ...newAuthor, password: e.target.value })}
                  placeholder="e.g. Press@2025!"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] font-mono outline-none focus:border-foreground rounded"
                />
                <p className="mt-1 text-[0.7rem] text-ink-soft">
                  The journalist can change this password anytime in their <strong>Profile & Security</strong> tab.
                </p>
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Full Name*</label>
                <input
                  type="text"
                  required
                  value={newAuthor.full_name}
                  onChange={(e) => setNewAuthor({ ...newAuthor, full_name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Role (Assign)</label>
                <select
                  value={newAuthor.role}
                  onChange={(e) => setNewAuthor({ ...newAuthor, role: e.target.value })}
                  className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                >
                  <option value="author">Author (Can draft and edit own stories)</option>
                  <option value="admin">Admin (Full administrative & editing access across newsroom)</option>
                  <option value="contributor">Contributor (Guest author drafts)</option>
                  <option value="user">User (Reader account)</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">Phone Number</label>
                  <input
                    type="tel"
                    value={newAuthor.phone}
                    onChange={(e) => setNewAuthor({ ...newAuthor, phone: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                  />
                </div>
                <div>
                  <label className="block text-[0.72rem] font-semibold uppercase text-ink-soft">City / Country</label>
                  <input
                    type="text"
                    value={newAuthor.city}
                    onChange={(e) => setNewAuthor({ ...newAuthor, city: e.target.value })}
                    className="mt-1 w-full border border-rule bg-background px-3 py-2 text-[0.88rem] outline-none focus:border-foreground rounded"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-rule px-4 py-2 text-[0.75rem] font-semibold uppercase hover:bg-secondary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="bg-red-600 px-4 py-2 text-[0.75rem] font-semibold uppercase text-white hover:bg-red-500 disabled:opacity-50 rounded"
                >
                  {modalSaving ? "Provisioning..." : "Provision Journalist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Handover Credentials Modal */}
      {provisionedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg border border-emerald-500/50 bg-background p-6 shadow-2xl rounded-lg">
            <div className="flex items-center gap-2 text-emerald-600 border-b border-rule pb-3">
              <Check className="h-6 w-6" />
              <h3 className="font-display text-[1.3rem] text-foreground">
                Journalist Account Ready!
              </h3>
            </div>
            <p className="mt-2 text-[0.85rem] text-ink-soft">
              A newsroom account for <strong>{provisionedCredentials.name}</strong> has been provisioned. Provide them these credentials to access their Author Dashboard:
            </p>

            <div className="mt-4 bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs space-y-2 border border-zinc-800">
              <div>
                <span className="text-zinc-500">Author Login URL:</span>{" "}
                <span className="text-emerald-400">https://premium-publish-pro.vercel.app/author-login</span>
              </div>
              <div>
                <span className="text-zinc-500">Email:</span>{" "}
                <span className="text-white font-semibold">{provisionedCredentials.email}</span>
              </div>
              <div>
                <span className="text-zinc-500">Initial Password:</span>{" "}
                <span className="text-amber-300 font-semibold">{provisionedCredentials.password}</span>
              </div>
              <div>
                <span className="text-zinc-500">Assigned Role:</span>{" "}
                <span className="text-blue-300 uppercase font-semibold">{provisionedCredentials.role}</span>
              </div>
            </div>

            <p className="mt-3 text-[0.75rem] text-ink-soft">
              Note: The journalist can sign in directly through the <code>/author-login</code> portal and change their password in the <strong>Profile & Security</strong> tab.
            </p>

            <div className="mt-5 flex justify-between items-center gap-3 border-t border-rule pt-4">
              <button
                type="button"
                onClick={async () => {
                  const handoverText = `Forbes Germany Journalist Newsroom Credentials:\n\nAuthor Login Portal: https://premium-publish-pro.vercel.app/author-login\nEmail: ${provisionedCredentials.email}\nInitial Password: ${provisionedCredentials.password}\nRole: ${provisionedCredentials.role}\n\nPlease sign in and update your password under Profile & Security.`;
                  await navigator.clipboard.writeText(handoverText);
                  alert("Journalist credentials copied to clipboard!");
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors rounded shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Credentials
              </button>
              <button
                type="button"
                onClick={() => setProvisionedCredentials(null)}
                className="border border-rule px-4 py-2 text-xs font-semibold uppercase hover:bg-secondary rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
