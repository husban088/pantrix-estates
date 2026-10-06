import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bed, Bath, Maximize, MapPin, Check, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { Property } from '../types';
import Img from '../components/Img';
import InquiryForm from '../components/InquiryForm';
import MortgageCalculator from '../components/MortgageCalculator';
import PropertyCard from '../components/PropertyCard';
import { money } from '../utils';

interface Est { estimate: number; low: number; high: number; perSqft: number; source: string }

export default function PropertyDetail() {
  const { id } = useParams();
  const [p, setP] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [err, setErr] = useState('');
  const [active, setActive] = useState(0);
  const [est, setEst] = useState<Est | null>(null);

  useEffect(() => {
    setP(null); setErr(''); setActive(0); setEst(null);
    api.get<Property>(`/properties/${id}`).then((r) => {
      setP(r);
      api.get<Est>(`/tools/estimate?city=${encodeURIComponent(r.city)}&sqft=${r.sqft}&beds=${r.beds}&category=${encodeURIComponent(r.category)}`).then(setEst).catch(() => undefined);
      api.get<Property[]>(`/properties?city=${encodeURIComponent(r.city)}`).then((rows) => setSimilar(rows.filter((x) => x.id !== r.id).slice(0, 3))).catch(() => undefined);
    }).catch((e: Error) => setErr(e.message));
  }, [id]);

  if (err) return (
    <div className="container-x py-32 text-center">
      <h1 className="text-5xl font-semibold text-pine-800">Property not found</h1>
      <p className="mt-3 text-muted">{err}</p>
      <Link to="/properties" className="btn-primary mt-8">Back to properties</Link>
    </div>
  );
  if (!p) return <div className="container-x py-10"><div className="h-[480px] animate-pulse rounded-3xl bg-pine-50" /></div>;

  const images = p.images.length ? p.images : [''];

  return (
    <div className="container-x pt-8">
      <Link to="/properties" className="link-line inline-flex items-center gap-2 text-sm font-bold text-pine-700 hover:text-brass-600"><ArrowLeft size={16} /> All properties</Link>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_140px]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-pine-100 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Img src={images[active]} alt={p.title} className="h-full w-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <span className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-bold ${p.type === 'sale' ? 'bg-white text-pine-700' : 'bg-brass-100 text-brass-600'}`}>{p.type === 'sale' ? 'For sale' : 'For rent'}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar lg:flex-col">
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} className={`aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 lg:w-full ${i === active ? 'border-brass-500 shadow-soft' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <Img src={src} alt={`${p.title} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brass-600"><MapPin size={15} /> {p.address || `${p.area}, ${p.city}`}</p>
          <h1 className="mt-2 text-5xl font-semibold leading-tight text-pine-800 sm:text-6xl">{p.title}</h1>
          <p className="mt-4 text-3xl font-bold text-ink">{money(p.price, p.type)}</p>

          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-pine-100 bg-pine-100">
            {[{ i: Bed, v: p.beds, l: 'Bedrooms' }, { i: Bath, v: p.baths, l: 'Bathrooms' }, { i: Maximize, v: p.sqft.toLocaleString(), l: 'Square feet' }].map((s) => (
              <div key={s.l} className="group bg-white p-5 text-center transition hover:bg-pine-50">
                <s.i className="mx-auto text-pine-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-brass-500" size={24} />
                <p className="mt-2 text-2xl font-bold text-ink">{s.v}</p>
                <p className="text-xs font-semibold text-muted">{s.l}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-3xl font-semibold text-pine-800">About this home</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">{p.description}</p>

          {p.amenities.length > 0 && (
            <>
              <h2 className="mt-12 text-3xl font-semibold text-pine-800">Amenities</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {p.amenities.map((a) => (
                  <div key={a} className="group flex items-center gap-3 rounded-2xl border border-pine-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:translate-x-1 hover:border-brass-300 hover:bg-pine-50">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-pine-100 text-pine-700 transition group-hover:bg-pine-700 group-hover:text-white"><Check size={14} /></span>{a}
                  </div>
                ))}
              </div>
            </>
          )}

          {est && p.type === 'sale' && (
            <div className="mt-12 flex items-start gap-4 rounded-3xl border border-brass-300 bg-white p-6 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brass-100 text-brass-600"><TrendingUp size={22} /></span>
              <div>
                <h3 className="text-2xl font-semibold text-pine-800">Estimated market value</h3>
                <p className="mt-1 text-xl font-bold text-ink">{money(est.low)} to {money(est.high)}</p>
                <p className="mt-1 text-sm text-muted">About {money(est.perSqft)} per sqft in {p.city}. Calculated by our {est.source} valuation service.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <InquiryForm propertyId={p.id} />
          {p.type === 'sale' && <MortgageCalculator price={p.price} />}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="text-4xl font-semibold text-pine-800">More homes in {p.city}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s, i) => <PropertyCard key={s.id} p={s} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}
