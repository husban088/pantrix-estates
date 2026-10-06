import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../api';
import { Property } from '../types';
import { CITIES, CATEGORIES } from '../config';
import PropertyCard from '../components/PropertyCard';

function Pill({ value, label, current, onClick }: { value: string; label: string; current: string; onClick: (v: string) => void }) {
  return (
    <button onClick={() => onClick(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${current === value ? 'border-pine-700 bg-pine-700 text-white shadow-soft' : 'border-pine-200 bg-white text-muted hover:-translate-y-0.5 hover:border-brass-500 hover:text-pine-700'}`}>{label}</button>
  );
}

export default function Properties() {
  const [sp, setSp] = useSearchParams();
  const [rows, setRows] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(sp.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);

  const type = sp.get('type') || '';
  const city = sp.get('city') || '';
  const category = sp.get('category') || '';
  const beds = sp.get('beds') || '';
  const max = sp.get('max') || '';
  const sort = sp.get('sort') || '';
  const query = sp.get('q') || '';

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams();
    Object.entries({ type, city, category, beds, max, sort, q: query }).forEach(([k, v]) => v && p.set(k, v));
    api.get<Property[]>(`/properties?${p.toString()}`).then(setRows).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [type, city, category, beds, max, sort, query]);

  useEffect(() => {
    const t = setTimeout(() => { if (q !== query) set('q', q); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const clear = () => { setQ(''); setSp({}, { replace: true }); };
  const active = [type, city, category, beds, max, query].filter(Boolean).length;

  return (
    <div className="container-x pb-8 pt-12">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <h1 className="text-5xl font-semibold text-pine-800 sm:text-6xl">Our properties</h1>
        <p className="mt-3 text-muted">Filter by city, type and budget to find homes worth visiting.</p>
      </motion.div>

      <div className="card mt-8 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-2xl border border-pine-100 px-4 py-3 transition focus-within:border-brass-500">
            <Search size={18} className="text-brass-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, area or city" className="w-full bg-transparent text-sm focus:outline-none" />
            {q && <button onClick={() => setQ('')} aria-label="Clear search"><X size={16} className="text-muted" /></button>}
          </label>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} className="field sm:w-52">
            <option value="">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button onClick={() => setShowFilters((s) => !s)} className="btn-outline sm:hidden"><SlidersHorizontal size={16} /> Filters {active > 0 && `(${active})`}</button>
        </div>
        <div className={`${showFilters ? 'block' : 'hidden'} mt-5 space-y-4 sm:block`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 w-16 text-xs font-semibold text-muted">Listing</span>
            <Pill value="" label="All" current={type} onClick={(v) => set('type', v)} />
            <Pill value="sale" label="For sale" current={type} onClick={(v) => set('type', v)} />
            <Pill value="rent" label="For rent" current={type} onClick={(v) => set('type', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 w-16 text-xs font-semibold text-muted">City</span>
            <Pill value="" label="Anywhere" current={city} onClick={(v) => set('city', v)} />
            {CITIES.map((c) => <Pill key={c} value={c} label={c} current={city} onClick={(v) => set('city', v)} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 w-16 text-xs font-semibold text-muted">Type</span>
            <Pill value="" label="Any" current={category} onClick={(v) => set('category', v)} />
            {CATEGORIES.map((c) => <Pill key={c} value={c} label={c} current={category} onClick={(v) => set('category', v)} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 w-16 text-xs font-semibold text-muted">Bedrooms</span>
            {['', '2', '3', '4', '5'].map((b) => <Pill key={b} value={b} label={b ? `${b}+` : 'Any'} current={beds} onClick={(v) => set('beds', v)} />)}
            <span className="ml-4 mr-2 text-xs font-semibold text-muted">Max price</span>
            <select value={max} onChange={(e) => set('max', e.target.value)} className="field w-44 py-2">
              <option value="">No limit</option>
              {[5000, 10000, 300000, 500000, 1000000, 2000000, 3000000].map((m) => <option key={m} value={m}>Up to {m.toLocaleString()}</option>)}
            </select>
            {active > 0 && <button onClick={clear} className="link-line ml-2 text-sm font-bold text-brass-600">Clear all</button>}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm font-semibold text-muted">{loading ? 'Searching...' : `${rows.length} ${rows.length === 1 ? 'property' : 'properties'} found`}</p>

      {error && <p className="mt-6 rounded-2xl bg-red-50 p-6 text-red-700">{error}</p>}

      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-3xl bg-pine-50" />)
          : rows.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
      </div>

      <AnimatePresence>
        {!loading && !error && rows.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 rounded-3xl border border-dashed border-pine-200 p-14 text-center">
            <p className="font-display text-3xl font-semibold text-pine-800">No homes match these filters</p>
            <p className="mt-2 text-muted">Try a wider budget or a different city.</p>
            <button onClick={clear} className="btn-primary mt-6">Reset filters</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
