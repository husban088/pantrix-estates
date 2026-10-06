import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthCard, { FormError } from "../components/AuthCard";
import PasswordField from "../components/PasswordField";

export default function Signup() {
  const nav = useNavigate();
  const { user, signup } = useAuth();
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) =>
    setF((p) => ({ ...p, [k]: v }));

  if (user) return <Navigate to="/profile" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (f.password.length < 6)
      return setErr("Password kam az kam 6 characters ka hona chahiye");
    if (f.password !== f.confirmPassword)
      return setErr("Password aur confirm password match nahi karte");
    setBusy(true);
    try {
      await signup(f);
      nav("/profile", { replace: true });
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Join Pantrix Estates in a minute."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="field"
            required
            value={f.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="field"
            type="email"
            required
            value={f.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input
            className="field"
            type="tel"
            value={f.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="+92 300 1234567"
            autoComplete="tel"
          />
        </div>
        <PasswordField
          label="Password"
          value={f.password}
          onChange={set("password")}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm password"
          value={f.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Type the password again"
          autoComplete="new-password"
        />
        <FormError msg={err} />
        <button className="btn-primary w-full" disabled={busy}>
          <UserPlus size={16} /> {busy ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Pehle se account hai?{" "}
        <Link to="/login" className="link-line font-semibold text-pine-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
