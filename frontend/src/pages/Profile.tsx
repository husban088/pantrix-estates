import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil,
  LogOut,
  Trash2,
  Lock,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Clock,
  FileText,
  User as UserIcon,
  AlertTriangle,
} from "lucide-react";
import { api } from "../api";
import { useAuth, User } from "../context/AuthContext";
import { Toast } from "../components/dash";
import { FormError } from "../components/AuthCard";
import PasswordField from "../components/PasswordField";
import { dateShort } from "../utils";

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-pine-100 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-700">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="mt-0.5 break-words font-semibold text-ink">
          {value || "Not added"}
        </p>
      </div>
    </div>
  );
}

function ConfirmDelete({
  open,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        // bahar (backdrop) par click karne se modal band ho jata hai
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-pine-900/40 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onCancel}
        >
          <motion.div
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lift"
          >
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={30} />
            </span>
            <h2 className="mt-5 text-3xl font-semibold text-pine-800">
              Delete account?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Aapka account aur saari profile details hamesha ke liye delete ho
              jayengi. Ye wapas nahi ho sakta.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="btn-outline"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700"
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Profile() {
  const nav = useNavigate();
  const { user, loading, setUser, logout } = useAuth();
  const [mode, setMode] = useState<"view" | "edit" | "password">("view");
  const [f, setF] = useState({ name: "", phone: "", city: "", bio: "" });
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [toast, setToast] = useState("");
  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  if (loading)
    return (
      <div className="container-x py-16">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-3xl bg-pine-50" />
      </div>
    );
  if (!user)
    return <Navigate to="/login" replace state={{ from: "/profile" }} />;

  const startEdit = (u: User) => {
    setF({ name: u.name, phone: u.phone, city: u.city, bio: u.bio });
    setErr("");
    setMode("edit");
  };
  const startPassword = () => {
    setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErr("");
    setMode("password");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const u = await api.put<User>("/me", f);
      setUser(u);
      setMode("view");
      say("Profile updated");
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (pw.newPassword.length < 6)
      return setErr("Naya password kam az kam 6 characters ka hona chahiye");
    if (pw.newPassword !== pw.confirmPassword)
      return setErr("Naya password aur confirm password match nahi karte");
    setBusy(true);
    try {
      await api.put("/me/password", pw);
      setMode("view");
      say("Password changed");
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const doLogout = () => {
    logout();
    nav("/", { replace: true });
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.del("/me");
      setAskDelete(false);
      logout();
      nav("/", { replace: true });
    } catch (x) {
      setAskDelete(false);
      say((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "U";

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-pine-700 text-4xl font-semibold text-brass-300 shadow-soft">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-4xl font-semibold text-pine-800">
                {user.name}
              </h1>
              <p className="truncate text-sm text-muted">{user.email}</p>
              <p className="mt-1 text-xs font-semibold text-brass-600">
                Member since {dateShort(user.createdAt)}
              </p>
            </div>
          </div>

          {mode === "view" && (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Detail icon={UserIcon} label="Full name" value={user.name} />
                <Detail icon={Mail} label="Email" value={user.email} />
                <Detail icon={Phone} label="Phone" value={user.phone} />
                <Detail icon={MapPin} label="City" value={user.city} />
                <Detail
                  icon={CalendarDays}
                  label="Joined"
                  value={dateShort(user.createdAt)}
                />
                <Detail
                  icon={Clock}
                  label="Last updated"
                  value={dateShort(user.updatedAt || user.createdAt)}
                />
                <div className="sm:col-span-2">
                  <Detail icon={FileText} label="About me" value={user.bio} />
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={() => startEdit(user)}>
                  <Pencil size={16} /> Edit profile
                </button>
                <button className="btn-outline" onClick={startPassword}>
                  <Lock size={16} /> Change password
                </button>
                <button className="btn-outline" onClick={doLogout}>
                  <LogOut size={16} /> Logout
                </button>
                <button
                  className="btn border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  onClick={() => setAskDelete(true)}
                >
                  <Trash2 size={16} /> Delete account
                </button>
              </div>
            </>
          )}

          {mode === "edit" && (
            <form onSubmit={save} className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold text-pine-800">
                Edit profile
              </h2>
              <div>
                <label className="label">Full name</label>
                <input
                  className="field"
                  required
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email (change nahi ho sakta)</label>
                <input
                  className="field opacity-60"
                  value={user.email}
                  disabled
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="field"
                    type="tel"
                    value={f.phone}
                    onChange={(e) => setF({ ...f, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input
                    className="field"
                    value={f.city}
                    onChange={(e) => setF({ ...f, city: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">About me</label>
                <textarea
                  className="field min-h-[110px]"
                  maxLength={300}
                  value={f.bio}
                  onChange={(e) => setF({ ...f, bio: e.target.value })}
                  placeholder="Apne baare me kuch likhein"
                />
              </div>
              <FormError msg={err} />
              <div className="flex gap-3">
                <button className="btn-primary" disabled={busy}>
                  {busy ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setMode("view")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {mode === "password" && (
            <form onSubmit={changePassword} className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold text-pine-800">
                Change password
              </h2>
              <PasswordField
                label="Current password"
                value={pw.currentPassword}
                onChange={(v) => setPw({ ...pw, currentPassword: v })}
                autoComplete="current-password"
              />
              <PasswordField
                label="New password"
                value={pw.newPassword}
                onChange={(v) => setPw({ ...pw, newPassword: v })}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm new password"
                value={pw.confirmPassword}
                onChange={(v) => setPw({ ...pw, confirmPassword: v })}
                autoComplete="new-password"
              />
              <FormError msg={err} />
              <div className="flex gap-3">
                <button className="btn-primary" disabled={busy}>
                  {busy ? "Saving..." : "Update password"}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setMode("view")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <ConfirmDelete
        open={askDelete}
        busy={busy}
        onCancel={() => !busy && setAskDelete(false)}
        onConfirm={doDelete}
      />
      <Toast msg={toast} />
    </div>
  );
}
