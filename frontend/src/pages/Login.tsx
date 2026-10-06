import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { api, auth } from '../api';
import Logo from '../components/Logo';

export default function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ email: 'admin@pantrix.com', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await api.post<{ token: string }>('/auth/login', f);
      auth.set(r.token);
      nav('/dashboard', { replace: true });
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }} className="card w-full max-w-md p-8 sm:p-10">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 text-center text-4xl font-semibold text-pine-800">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">Manage listings, inquiries and insights.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div><label className="label">Email</label><input className="field" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input className="field" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="Enter your password" /></div>
          {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}><Lock size={16} /> {busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="mt-6 rounded-xl bg-pine-50 px-4 py-3 text-center text-xs text-muted">Login details backend/.env file me hain (ADMIN_EMAIL aur ADMIN_PASSWORD).</p>
        <p className="mt-5 text-center text-sm text-muted"><Link to="/" className="link-line font-semibold text-pine-700">Back to website</Link></p>
      </motion.div>
    </div>
  );
}
