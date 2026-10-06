import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

export default function InquiryForm({ propertyId, title = 'Ask about this property', cta = 'Send inquiry' }: { propertyId?: string; title?: string; cta?: string }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', budget: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api.post('/inquiries', { ...f, budget: Number(f.budget) || 0, propertyId });
      setDone(true);
      setF({ name: '', email: '', phone: '', budget: '', message: '' });
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <h3 className="text-2xl font-semibold text-pine-800">{title}</h3>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-2xl bg-pine-50 p-6 text-center">
            <CheckCircle2 className="mx-auto text-pine-600" size={44} />
            <p className="mt-3 text-lg font-semibold text-pine-800">Inquiry sent</p>
            <p className="mt-1 text-sm text-muted">An advisor will reply within one working day.</p>
            <button className="btn-outline mt-5" onClick={() => setDone(false)}>Send another</button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-4">
            <div><label className="label">Full name</label><input className="field" required value={f.name} onChange={set('name')} placeholder="Your name" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Email</label><input className="field" type="email" required value={f.email} onChange={set('email')} placeholder="you@email.com" /></div>
              <div><label className="label">Phone</label><input className="field" value={f.phone} onChange={set('phone')} placeholder="+92 300 0000000" /></div>
            </div>
            <div><label className="label">Budget (optional)</label><input className="field" type="number" min="0" value={f.budget} onChange={set('budget')} placeholder="e.g. 500000" /></div>
            <div><label className="label">Message</label><textarea className="field min-h-[110px] resize-y" required value={f.message} onChange={set('message')} placeholder="Tell us when you would like to visit or what you need." /></div>
            {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
            <button className="btn-primary w-full" disabled={busy}><Send size={16} /> {busy ? 'Sending...' : cta}</button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
