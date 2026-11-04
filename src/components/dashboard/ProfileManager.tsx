import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChangePasswordCard } from "./ChangePasswordCard";

export function ProfileManager({ session }: { session: any }) {
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
    <section className="mt-4 max-w-3xl">
      <div className="border-b border-rule pb-4">
        <h2 className="headline text-[1.6rem] text-foreground">Profile & Account Settings</h2>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          Manage your personal details, public bio, and contact information for article attribution.
        </p>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
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
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground rounded"
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
              className="mt-2 w-full border border-rule bg-secondary/30 px-3.5 py-2.5 text-[0.95rem] text-ink-soft outline-none cursor-not-allowed rounded"
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
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground rounded"
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
              className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground rounded"
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
            className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-foreground rounded"
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
            className="mt-2 w-full border border-rule bg-background p-3.5 text-[0.95rem] leading-relaxed outline-none focus:border-foreground rounded"
          />
        </div>

        {message && (
          <div
            className={`p-3 text-[0.85rem] font-medium border rounded ${
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
            className="bg-foreground px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50 rounded"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Security & Password Management */}
      <ChangePasswordCard />
    </section>
  );
}
