import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { api } from "../api";
import AuthCard, { FormError } from "../components/AuthCard";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await api.post<{ ok: boolean; code?: string }>(
        "/auth/forgot-password",
        { email },
      );
      setCode(r.code || "");
      setSent(true);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const goReset = () =>
    nav(
      `/reset-password?email=${encodeURIComponent(email)}${code ? `&code=${code}` : ""}`,
    );

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Apna email likhein, hum reset code bana denge."
    >
      {!sent ? (
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
          <FormError msg={err} />
          <button className="btn-primary w-full" disabled={busy}>
            <KeyRound size={16} /> {busy ? "Please wait..." : "Get reset code"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {code ? (
            <div className="rounded-2xl bg-pine-50 p-5 text-center">
              <p className="text-xs font-semibold text-muted">
                Aapka reset code (15 minute tak valid)
              </p>
              <p className="mt-2 text-4xl font-bold tracking-[0.3em] text-pine-700">
                {code}
              </p>
              <p className="mt-3 text-xs text-muted">
                Email service connected nahi hai, isliye code yahin dikh raha
                hai.
              </p>
            </div>
          ) : (
            <p className="rounded-2xl bg-pine-50 p-5 text-center text-sm text-pine-800">
              Agar is email se account hai to reset code bhej diya gaya hai.
            </p>
          )}
          <button className="btn-primary w-full" onClick={goReset}>
            Continue to reset password
          </button>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="link-line font-semibold text-pine-700">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
