import { useState } from "react";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ChangePasswordCard() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwdMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    setUpdating(true);
    setPwdMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwdMessage({ text: "Password changed successfully! Keep your new credentials secure.", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMessage({ text: err.message || "Failed to update password.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-12 border-t border-rule pt-8">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-brand" />
        <h3 className="font-display text-[1.4rem] text-foreground">Security & Password</h3>
      </div>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        Change your newsroom password at any time. You can use your updated credentials next time you access the portal.
      </p>

      <form onSubmit={handleUpdatePassword} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-[0.75rem] font-semibold uppercase tracking-wider text-ink-soft">
            New Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full border border-rule bg-background px-3.5 py-2 text-[0.9rem] outline-none focus:border-foreground rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-foreground text-xs font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[0.75rem] font-semibold uppercase tracking-wider text-ink-soft">
            Confirm New Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="mt-1 w-full border border-rule bg-background px-3.5 py-2 text-[0.9rem] outline-none focus:border-foreground rounded"
          />
        </div>

        {pwdMessage && (
          <div
            className={`p-3 text-[0.85rem] font-medium border rounded ${
              pwdMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {pwdMessage.text}
          </div>
        )}

        <button
          type="submit"
          disabled={updating || !newPassword}
          className="bg-foreground px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50 transition-colors rounded"
        >
          {updating ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
