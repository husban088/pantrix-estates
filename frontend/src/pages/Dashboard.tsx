import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, MessageSquare, Wrench, LogOut, Plus, Pencil, Trash2, Star, Home as HomeIcon,
  Flame, Wallet, CheckCircle2, Inbox, Search, Server, RefreshCw, ExternalLink,
} from 'lucide-react';
import { api, auth } from '../api';
import { Inquiry, Property, ServiceStatus, Stats } from '../types';
import { compact, dateShort, money } from '../utils';
import { Modal, Panel, StatCard, Toast } from '../components/dash';
import PropertyForm from '../components/PropertyForm';
import Logo from '../components/Logo';
import Img from '../components/Img';
import { CATEGORIES, CITIES } from '../config';

type Tab = 'overview' | 'properties' | 'inquiries' | 'tools';
const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'properties', label: 'Properties', icon: Building2 },
  { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  { id: 'tools', label: 'Tools', icon: Wrench },
];
const palette = ['#0e4a3c', '#418570', '#b08a3e', '#97c3b0', '#dcc283', '#c3ddd1'];
const gradeStyle: Record<string, string> = { Hot: 'bg-red-50 text-red-700', Warm: 'bg-brass-100 text-brass-600', Cold: 'bg-pine-50 text-pine-600' };

/* ---------------- Overview ---------------- */
function Overview({ stats }: { stats: Stats }) {
  const t = stats.totals;
  const maxMonth = Math.max(1, ...stats.monthly.map((m) => m.inquiries));
  const maxCity = Math.max(1, ...stats.byCity.map((c) => c.count));
  const totalCat = Math.max(1, stats.byCategory.reduce((a, c) => a + c.count, 0));
  let acc = 0;
  const donut = stats.byCategory.map((c, i) => { const from = (acc / totalCat) * 100; acc += c.count; return `${palette[i % palette.length]} ${from}% ${(acc / totalCat) * 100}%`; }).join(', ');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Building2} label="Total properties" value={String(t.properties)} />
        <StatCard icon={CheckCircle2} label="Available now" value={String(t.available)} delay={0.05} />
        <StatCard icon={Inbox} label="New inquiries" value={String(t.newInquiries)} delay={0.1} />
        <StatCard icon={Flame} label="Hot leads" value={String(t.hotLeads)} delay={0.15} />
        <StatCard icon={Wallet} label="Portfolio value (sale)" value={compact(t.portfolioValue)} delay={0.2} />
        <StatCard icon={Star} label="Average sale price" value={compact(t.avgSalePrice)} delay={0.25} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Inquiries in the last 6 months">
          <div className="flex h-56 items-end gap-3 sm:gap-5">
            {stats.monthly.map((m, i) => (
              <div key={m.month + i} className="group flex flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-bold text-pine-700 opacity-0 transition group-hover:opacity-100">{m.inquiries}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((m.inquiries / maxMonth) * 100, 4)}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-pine-700 to-pine-400 transition-all duration-300 group-hover:from-brass-500 group-hover:to-brass-300" />
                <span className="text-xs font-semibold text-muted">{m.month}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Property mix">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 1 }} className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${donut})` }}>
              <div className="absolute inset-6 grid place-items-center rounded-full bg-white text-center"><div><p className="text-3xl font-bold text-ink">{t.properties}</p><p className="text-xs font-semibold text-muted">listings</p></div></div>
            </motion.div>
            <ul className="w-full space-y-2">
              {stats.byCategory.map((c, i) => (
                <li key={c.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-semibold text-ink"><span className="h-3 w-3 rounded-full" style={{ background: palette[i % palette.length] }} />{c.name}</span><span className="text-muted">{c.count}</span></li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Listings by city">
          <div className="space-y-4">
            {stats.byCity.map((c, i) => (
              <div key={c.name}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold text-ink">{c.name}</span><span className="text-muted">{c.count} {c.count === 1 ? 'listing' : 'listings'}{c.value ? ` · ${compact(c.value)}` : ''}</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-pine-50"><motion.div initial={{ width: 0 }} animate={{ width: `${(c.count / maxCity) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.08 }} className="h-full rounded-full bg-gradient-to-r from-pine-600 to-brass-400" /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Latest inquiries">
          <ul className="divide-y divide-pine-100">
            {stats.recentInquiries.length === 0 && <li className="py-6 text-center text-sm text-muted">No inquiries yet.</li>}
            {stats.recentInquiries.map((q) => (
              <li key={q.id} className="flex items-start justify-between gap-4 py-3.5 transition hover:pl-2">
                <div className="min-w-0"><p className="truncate font-bold text-ink">{q.name}</p><p className="truncate text-sm text-muted">{q.propertyTitle}</p></div>
                <div className="shrink-0 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${gradeStyle[q.grade]}`}>{q.grade}</span><p className="mt-1 text-xs text-muted">{dateShort(q.createdAt)}</p></div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Properties ---------------- */
function PropertiesTab({ rows, onAdd, onEdit, onDelete, onFeature }: { rows: Property[]; onAdd: () => void; onEdit: (p: Property) => void; onDelete: (p: Property) => void; onFeature: (p: Property) => void }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [cat, setCat] = useState('');
  const list = rows.filter((p) => (!q || `${p.title} ${p.city} ${p.area}`.toLowerCase().includes(q.toLowerCase())) && (!city || p.city === city) && (!cat || p.category === cat));
  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-pine-100 bg-white px-4 py-3 transition focus-within:border-brass-500"><Search size={18} className="text-brass-500" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings" className="w-full bg-transparent text-sm focus:outline-none" /></label>
        <select className="field lg:w-44" value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select className="field lg:w-44" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All types</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn-primary" onClick={onAdd}><Plus size={16} /> Add property</button>
      </div>
      <div className="mt-6 space-y-3">
        {list.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }} className="group flex flex-col gap-4 rounded-3xl border border-pine-100 bg-white p-4 transition-all duration-300 hover:border-brass-300 hover:shadow-soft sm:flex-row sm:items-center">
            <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-32"><Img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold text-pine-800">{p.title}</p>
              <p className="truncate text-sm text-muted">{p.area}, {p.city} · {p.category}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:w-64 sm:justify-end">
              <span className="font-bold text-ink">{money(p.price, p.type)}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${p.status === 'available' ? 'bg-pine-50 text-pine-700' : 'bg-brass-100 text-brass-600'}`}>{p.status}</span>
            </div>
            <div className="flex gap-2">
              <button title={p.featured ? 'Remove from featured' : 'Make featured'} onClick={() => onFeature(p)} className={`grid h-10 w-10 place-items-center rounded-full border transition hover:-translate-y-0.5 ${p.featured ? 'border-brass-500 bg-brass-100 text-brass-600' : 'border-pine-200 text-muted hover:text-brass-600'}`}><Star size={16} fill={p.featured ? 'currentColor' : 'none'} /></button>
              <Link title="View on website" to={`/properties/${p.id}`} className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-muted transition hover:-translate-y-0.5 hover:border-pine-700 hover:text-pine-700"><ExternalLink size={16} /></Link>
              <button title="Edit" onClick={() => onEdit(p)} className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-muted transition hover:-translate-y-0.5 hover:border-pine-700 hover:text-pine-700"><Pencil size={16} /></button>
              <button title="Delete" onClick={() => onDelete(p)} className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-muted transition hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          </motion.div>
        ))}
        {list.length === 0 && <p className="rounded-3xl border border-dashed border-pine-200 p-12 text-center text-muted">No properties found. Add your first listing.</p>}
      </div>
    </div>
  );
}

/* ---------------- Inquiries ---------------- */
function InquiriesTab({ rows, onStatus, onDelete }: { rows: Inquiry[]; onStatus: (q: Inquiry, s: Inquiry['status']) => void; onDelete: (q: Inquiry) => void }) {
  const [filter, setFilter] = useState<'all' | Inquiry['status']>('all');
  const list = rows.filter((q) => filter === 'all' || q.status === filter);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'closed'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${filter === s ? 'border-pine-700 bg-pine-700 text-white' : 'border-pine-200 text-muted hover:border-brass-500 hover:text-pine-700'}`}>{s} {s === 'all' ? `(${rows.length})` : `(${rows.filter((q) => q.status === s).length})`}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {list.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }} className="rounded-3xl border border-pine-100 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-300 hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="truncate text-xl font-semibold text-pine-800">{q.name}</p><p className="truncate text-sm text-muted">{q.email}{q.phone ? ` · ${q.phone}` : ''}</p></div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${gradeStyle[q.grade]}`}>{q.grade} · {q.score}</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-brass-600">{q.propertyTitle}{q.budget ? ` · Budget ${money(q.budget)}` : ''}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{q.message}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-pine-100 pt-4">
              <span className="text-xs text-muted">{dateShort(q.createdAt)}</span>
              <div className="flex items-center gap-2">
                <select value={q.status} onChange={(e) => onStatus(q, e.target.value as Inquiry['status'])} className="rounded-full border border-pine-200 bg-white px-3 py-2 text-xs font-bold capitalize text-pine-700 focus:outline-none focus:ring-2 focus:ring-brass-300">
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
                </select>
                <a href={`mailto:${q.email}`} className="btn-outline px-4 py-2 text-xs">Reply</a>
                <button title="Delete" onClick={() => onDelete(q)} className="grid h-9 w-9 place-items-center rounded-full border border-pine-200 text-muted transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {list.length === 0 && <p className="rounded-3xl border border-dashed border-pine-200 p-12 text-center text-muted">No inquiries here yet.</p>}
    </div>
  );
}

/* ---------------- Tools ---------------- */
function ToolsTab() {
  const [price, setPrice] = useState('1000000');
  const [ltype, setLtype] = useState<'sale' | 'rent'>('sale');
  const [com, setCom] = useState<{ rate: number; total: number; agent: number; agency: number; source: string } | null>(null);
  const [v, setV] = useState({ city: 'Lahore', sqft: '3000', beds: '4', category: 'House' });
  const [est, setEst] = useState<{ estimate: number; low: number; high: number; perSqft: number; source: string } | null>(null);
  const [svcs, setSvcs] = useState<ServiceStatus[]>([]);
  const [spin, setSpin] = useState(false);

  const checkSvcs = useCallback(() => {
    setSpin(true);
    api.get<ServiceStatus[]>('/services/status').then(setSvcs).catch(() => setSvcs([])).finally(() => setSpin(false));
  }, []);
  useEffect(() => { checkSvcs(); }, [checkSvcs]);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel title="Commission calculator">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Price</label><input className="field" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div><label className="label">Deal type</label><select className="field" value={ltype} onChange={(e) => setLtype(e.target.value as 'sale' | 'rent')}><option value="sale">Sale</option><option value="rent">Rent (monthly)</option></select></div>
        </div>
        <button className="btn-primary mt-4" onClick={() => api.get<typeof com>(`/tools/commission?price=${Number(price) || 0}&type=${ltype}`).then(setCom)}>Calculate commission</button>
        {com && <div className="mt-5 rounded-2xl bg-pine-50 p-5"><p className="text-3xl font-bold text-pine-700">{money(com.total)}</p><p className="mt-1 text-sm text-muted">Rate {com.rate}% · agent {money(com.agent)} · agency {money(com.agency)} · by {com.source}</p></div>}
      </Panel>

      <Panel title="Market valuation">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">City</label><input className="field" list="vc" value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} /><datalist id="vc">{CITIES.map((c) => <option key={c} value={c} />)}</datalist></div>
          <div><label className="label">Category</label><select className="field" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Area (sqft)</label><input className="field" type="number" value={v.sqft} onChange={(e) => setV({ ...v, sqft: e.target.value })} /></div>
          <div><label className="label">Bedrooms</label><input className="field" type="number" value={v.beds} onChange={(e) => setV({ ...v, beds: e.target.value })} /></div>
        </div>
        <button className="btn-primary mt-4" onClick={() => api.get<typeof est>(`/tools/estimate?city=${encodeURIComponent(v.city)}&sqft=${Number(v.sqft) || 0}&beds=${Number(v.beds) || 0}&category=${v.category}`).then(setEst)}>Estimate value</button>
        {est && <div className="mt-5 rounded-2xl bg-pine-50 p-5"><p className="text-3xl font-bold text-pine-700">{money(est.estimate)}</p><p className="mt-1 text-sm text-muted">Range {money(est.low)} to {money(est.high)} · {money(est.perSqft)}/sqft · by {est.source}</p></div>}
      </Panel>

      <Panel title="Backend services" className="xl:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          {svcs.map((s) => (
            <div key={s.name} className="flex items-center gap-4 rounded-2xl border border-pine-100 p-4">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${s.online ? 'bg-pine-50 text-pine-700' : 'bg-pine-50/50 text-muted'}`}><Server size={20} /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-bold text-ink">{s.name}</p><p className="text-xs text-muted">{s.tech} · port {s.port}</p></div>
              <span className={`flex items-center gap-1.5 text-xs font-bold ${s.online ? 'text-pine-600' : 'text-muted'}`}><span className={`h-2.5 w-2.5 rounded-full ${s.online ? 'animate-pulse bg-pine-500' : 'bg-pine-200'}`} />{s.online ? 'Online' : 'Offline'}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="btn-outline" onClick={checkSvcs}><RefreshCw size={15} className={spin ? 'animate-spin' : ''} /> Check again</button>
          <p className="text-sm text-muted">Offline service par bhi website chalti hai, calculations Node backend khud kar leta hai.</p>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Page ---------------- */
function NavButtons({ tab, setTab, newCount, mobile }: { tab: Tab; setTab: (t: Tab) => void; newCount: number; mobile?: boolean }) {
  return (
    <>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${tab === t.id ? 'text-white' : 'text-muted hover:bg-pine-50 hover:text-pine-700'} ${mobile ? '' : 'w-full'}`}>
          {tab === t.id && <motion.span layoutId={mobile ? 'tabM' : 'tabD'} className="absolute inset-0 rounded-2xl bg-pine-700 shadow-soft" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <t.icon size={18} className="relative" /><span className="relative">{t.label}</span>
          {t.id === 'inquiries' && newCount > 0 && <span className="relative ml-auto rounded-full bg-brass-500 px-2 py-0.5 text-[10px] font-bold text-white">{newCount}</span>}
        </button>
      ))}
    </>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [props, setProps] = useState<Property[]>([]);
  const [inqs, setInqs] = useState<Inquiry[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [editing, setEditing] = useState<Property | 'new' | null>(null);
  const [toast, setToast] = useState('');

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const load = useCallback(async () => {
    try {
      const [s, p, i] = await Promise.all([api.get<Stats>('/stats'), api.get<Property[]>('/properties'), api.get<Inquiry[]>('/inquiries')]);
      setStats(s); setProps(p); setInqs(i); setLoadErr('');
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === 'Login required') nav('/login', { replace: true });
      else setLoadErr(msg);
    }
  }, [nav]);

  useEffect(() => {
    load();
  }, [load, nav]);

  const newCount = stats?.totals.newInquiries ?? 0;
  const logout = () => { auth.clear(); nav('/'); };

  const del = async (p: Property) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try { await api.del(`/properties/${p.id}`); say('Property deleted'); load(); } catch (e) { say((e as Error).message); }
  };
  const feature = async (p: Property) => {
    try { await api.put(`/properties/${p.id}`, { ...p, featured: !p.featured }); load(); say(p.featured ? 'Removed from featured' : 'Marked as featured'); } catch (e) { say((e as Error).message); }
  };
  const setStatus = async (q: Inquiry, status: Inquiry['status']) => {
    try { await api.patch(`/inquiries/${q.id}`, { status }); load(); } catch (e) { say((e as Error).message); }
  };
  const delInq = async (q: Inquiry) => {
    if (!window.confirm(`Delete inquiry from ${q.name}?`)) return;
    try { await api.del(`/inquiries/${q.id}`); say('Inquiry deleted'); load(); } catch (e) { say((e as Error).message); }
  };

  return (
    <div className="min-h-screen bg-white lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-pine-100 bg-white p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Logo />
        <nav className="mt-10 space-y-1.5"><NavButtons tab={tab} setTab={setTab} newCount={newCount} /></nav>
        <div className="mt-auto space-y-2">
          <Link to="/" className="btn-outline w-full"><HomeIcon size={16} /> View website</Link>
          <button onClick={logout} className="btn w-full text-muted hover:bg-pine-50 hover:text-red-600"><LogOut size={16} /> Exit dashboard</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-40 border-b border-pine-100 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <Logo />
            <div className="flex gap-2">
              <Link to="/" aria-label="Website" className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-pine-700"><HomeIcon size={17} /></Link>
              <button onClick={logout} aria-label="Exit dashboard" className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-pine-700"><LogOut size={17} /></button>
            </div>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3"><NavButtons tab={tab} setTab={setTab} newCount={newCount} mobile /></div>
        </div>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} key={tab}>
            <h1 className="text-4xl font-semibold text-pine-800 sm:text-5xl">{tabs.find((t) => t.id === tab)!.label}</h1>
            <p className="mb-8 mt-2 text-sm text-muted">
              {tab === 'overview' && 'Your portfolio and leads at a glance.'}
              {tab === 'properties' && 'Add, edit and feature the homes shown on your website.'}
              {tab === 'inquiries' && 'Follow up with the people interested in your homes.'}
              {tab === 'tools' && 'Calculators and the status of your backend services.'}
            </p>
          </motion.div>

          {loadErr && <p className="mb-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700">{loadErr} <button className="ml-2 font-bold underline" onClick={load}>Retry</button></p>}
          {!stats && !loadErr && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-pine-50" />)}</div>}

          {stats && tab === 'overview' && <Overview stats={stats} />}
          {stats && tab === 'properties' && <PropertiesTab rows={props} onAdd={() => setEditing('new')} onEdit={setEditing} onDelete={del} onFeature={feature} />}
          {stats && tab === 'inquiries' && <InquiriesTab rows={inqs} onStatus={setStatus} onDelete={delInq} />}
          {tab === 'tools' && <ToolsTab />}
        </main>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add property' : 'Edit property'}>
        {editing !== null && (
          <PropertyForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onSaved={(m) => { setEditing(null); say(m); load(); }} />
        )}
      </Modal>
      <Toast msg={toast} />
    </div>
  );
}
