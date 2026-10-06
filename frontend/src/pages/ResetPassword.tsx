import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { api } from "../api";
import AuthCard, { FormError } from "../components/AuthCard";
import PasswordField from "../components/PasswordField";

export default function ResetPassword() {
  const nav = useNavigate();
  const [q] = useSearchParams();
  const [f, setF] = useState({
    email: q.get("email") || "",
    code: q.get("code") || "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (v: string) =>
    setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.password.length < 6)
      return setErr("Password kam az kam 6 characters ka hona chahiye");
    if (f.password !== f.confirmPassword)
      return setErr("Password aur confirm password match nahi karte");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", f);
      setDone(true);
      setTimeout(() => nav("/login", { replace: true }), 1800);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Reset password"
      subtitle="Reset code aur naya password likhein."
    >
      {done ? (
        <p className="rounded-2xl bg-pine-50 p-5 text-center text-sm font-semibold text-pine-800">
          Password change ho gaya! Login page par ja rahe hain...
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="field"
              type="email"
              required
              value={f.email}
              onChange={(e) => set("email")(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Reset code</label>
            <input
              className="field tracking-[0.3em]"
              required
              inputMode="numeric"
              maxLength={6}
              value={f.code}
              onChange={(e) => set("code")(e.target.value)}
              placeholder="6 digit code"
            />
          </div>
          <PasswordField
            label="New password"
            value={f.password}
            onChange={set("password")}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm new password"
            value={f.confirmPassword}
            onChange={set("confirmPassword")}
            placeholder="Type the password again"
            autoComplete="new-password"
          />
          <FormError msg={err} />
          <button className="btn-primary w-full" disabled={busy}>
            <ShieldCheck size={16} /> {busy ? "Saving..." : "Change password"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="link-line font-semibold text-pine-700">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
