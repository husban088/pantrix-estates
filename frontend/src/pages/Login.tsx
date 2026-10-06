import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthCard, { FormError } from "../components/AuthCard";
import PasswordField from "../components/PasswordField";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, login } = useAuth();
  const from = (loc.state as { from?: string } | null)?.from || "/profile";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to see and manage your profile."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="field"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="link-line text-xs font-semibold text-pine-700"
          >
            Forgot password?
          </Link>
        </div>
        <FormError msg={err} />
        <button className="btn-primary w-full" disabled={busy}>
          <Lock size={16} /> {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Account nahi hai?{" "}
        <Link to="/signup" className="link-line font-semibold text-pine-700">
          Sign up
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted">
        <Link to="/" className="link-line font-semibold text-pine-700">
          Back to website
        </Link>
      </p>
    </AuthCard>
  );
}
