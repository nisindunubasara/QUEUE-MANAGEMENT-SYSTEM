import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/staffService";

const PROFILE_FIELDS = [
  { key: "name", label: "Full Name", type: "text" },
  { key: "email", label: "Email Address", type: "email" },
  { key: "username", label: "Username", type: "text" },
  { key: "phone", label: "Contact Number", type: "tel" },
];

export default function StaffProfile() {
  const { user, updateAuthUser } = useAuth();
  
  const initialProfile = useMemo(() => ({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
  }), [user]);

  const [profileState, setProfileState] = useState(initialProfile);
  const [editField, setEditField] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { setProfileState(initialProfile); }, [initialProfile]);

  const handleInlineSave = async (key) => {
    const nextValue = String(draftValue || "").trim();
    if (!nextValue || nextValue === profileState[key]) {
      setEditField(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await updateUserProfile({ [key]: nextValue });
      if (response?.success) {
        const updatedUser = response?.user || response?.data?.user || {};
        updateAuthUser(updatedUser);
        setProfileState((prev) => ({
          ...prev,
          ...updatedUser,
          [key]: updatedUser?.[key] ?? nextValue,
        }));
        setSuccess(`${key.charAt(0).toUpperCase() + key.slice(1)} updated successfully.`);
        setEditField(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to update profile.");
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updateUserProfile({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword
      });
      setSuccess("Password changed successfully.");
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err?.message || "Failed to change password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your profile and account security.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {/* Profile Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{field.label}</label>
              <div className="flex items-center justify-between gap-4">
                {editField === field.key ? (
                  <input
                    type={field.type}
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                    autoFocus
                  />
                ) : (
                  <span className="text-slate-700 font-medium">{profileState[field.key] || "Not set"}</span>
                )}
                
                <div className="flex gap-2">
                  {editField === field.key ? (
                    <>
                      <button onClick={() => handleInlineSave(field.key)} className="text-xs font-bold text-sky-600 hover:underline">Save</button>
                      <button onClick={() => setEditField(null)} className="text-xs font-bold text-slate-400">Cancel</button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setEditField(field.key); setDraftValue(profileState[field.key]); }}
                      className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Security & Password</h2>
          {!passwordOpen && (
            <button 
              onClick={() => setPasswordOpen(true)}
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Change Password
            </button>
          )}
        </div>

        {passwordOpen && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100" 
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPasswordOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
              <button 
                type="submit" 
                disabled={loading}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
