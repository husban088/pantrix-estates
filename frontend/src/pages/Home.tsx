import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ShieldCheck, KeyRound, Gem, Handshake, Quote, MapPin } from 'lucide-react';
import { api } from '../api';
import { Property } from '../types';
import { CITIES, CATEGORIES } from '../config';
import PropertyCard from '../components/PropertyCard';
import HeroShowcase from '../components/HeroShowcase';
import Frame from '../components/Frame';
import Reveal from '../components/Reveal';
import Counter from '../components/Counter';

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  { icon: ShieldCheck, title: 'Verified listings only', text: 'Every home is inspected and its paperwork checked before it reaches you.' },
  { icon: Gem, title: 'Access to private homes', text: 'Early access to properties that never appear on public portals.' },
  { icon: Handshake, title: 'Negotiation on your side', text: 'Our advisors negotiate price and terms the way they would for their own family.' },
  { icon: KeyRound, title: 'Keys without the stress', text: 'Legal, financing and handover are handled in one place, start to finish.' },
];

const steps = [
  { t: 'Tell us what you need', d: 'Share your city, budget and the kind of home you imagine.' },
  { t: 'Tour your shortlist', d: 'We arrange private viewings, in person or by video.' },
  { t: 'Move in with confidence', d: 'We handle contracts, financing and handover for you.' },
];

const reviews = [
  { q: 'We found our Islamabad villa in nine days. Every viewing was on time and every number was honest.', n: 'Ayesha Khan', r: 'Bought a villa in F-7' },
  { q: 'They negotiated far below the asking price for our Dubai penthouse and handled every document.', n: 'Omar Siddiqui', r: 'Bought a penthouse in Downtown Dubai' },
  { q: 'Relocating from London felt easy. The apartment was furnished and waiting when we landed.', n: 'Sara Malik', r: 'Rents in Clifton, Karachi' },
];

export default function Home() {
  const nav = useNavigate();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState({ type: 'sale', city: '', category: '' });
  const [rev, setRev] = useState(0);

  useEffect(() => {
    api.get<Property[]>('/properties?featured=1').then((r) => setFeatured(r.slice(0, 6))).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const t = setInterval(() => setRev((r) => (r + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    p.set('type', q.type);
    if (q.city) p.set('city', q.city);
    if (q.category) p.set('category', q.category);
    nav(`/properties?${p.toString()}`);
  };

  const words = 'Find the home that already feels like yours'.split(' ');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-pine-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-brass-100/80 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 pb-10 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
          <div>
            <motion.span initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }} className="inline-flex items-center gap-2 rounded-full border border-brass-300 bg-white px-4 py-2 text-sm font-semibold text-brass-600 shadow-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brass-500" /> Trusted by 1,200+ families
            </motion.span>
            <h1 className="mt-6 text-[2.9rem] font-semibold leading-[1.02] text-pine-800 sm:text-6xl lg:text-[4.6rem]">
              {words.map((w, i) => (
                <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                  <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease }}>{w}</motion.span>
                </span>
              ))}
            </h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.7, ease }} className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Villas, penthouses and family houses in Islamabad, Lahore, Karachi, Dubai and London, with advisors who handle everything from the first viewing to the keys.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease }} className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties" className="btn-primary">Browse properties <ArrowRight size={16} /></Link>
              <Link to="/contact" className="btn-outline">Speak to an advisor</Link>
            </motion.div>
          </div>

          <HeroShowcase />
        </div>

        {/* Search */}
        <div className="container-x relative pb-12">
          <motion.form onSubmit={search} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.8, ease }} className="card mx-auto max-w-5xl p-3 sm:p-4">
            <div className="mb-3 flex gap-1 rounded-full bg-pine-50 p-1 sm:w-fit">
              {(['sale', 'rent'] as const).map((t) => (
                <button type="button" key={t} onClick={() => setQ({ ...q, type: t })} className="relative flex-1 rounded-full px-6 py-2 text-sm font-semibold sm:flex-none">
                  {q.type === t && <motion.span layoutId="searchTab" className="absolute inset-0 rounded-full bg-pine-700" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className={`relative transition-colors ${q.type === t ? 'text-white' : 'text-muted'}`}>{t === 'sale' ? 'Buy' : 'Rent'}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-pine-100 px-4 py-3 transition focus-within:border-brass-500">
                <MapPin size={18} className="text-brass-500" />
                <select value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none">
                  <option value="">Any city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-pine-100 px-4 py-3 transition focus-within:border-brass-500">
                <Search size={18} className="text-brass-500" />
                <select value={q.category} onChange={(e) => setQ({ ...q, category: e.target.value })} className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none">
                  <option value="">Any property type</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <button className="btn-primary md:px-10">Search homes</button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Cities marquee */}
      <section className="border-y border-pine-100 py-5">
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee gap-14 whitespace-nowrap">
            {[...CITIES, ...CITIES, ...CITIES, ...CITIES].map((c, i) => (
              <Link key={i} to={`/properties?city=${c}`} className="font-display text-3xl font-semibold text-pine-300 transition-colors hover:text-brass-500">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-x pt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold text-pine-800 sm:text-5xl">Homes our advisors love</h2>
            <p className="mt-3 max-w-xl text-muted">A rotating selection of the finest available properties this month.</p>
          </div>
          <Link to="/properties" className="link-line flex items-center gap-2 text-sm font-bold text-pine-700 hover:text-brass-600">View all properties <ArrowRight size={16} /></Link>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-3xl bg-pine-50" />)
            : featured.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>
        {!loading && featured.length === 0 && <p className="mt-10 rounded-2xl bg-pine-50 p-8 text-center text-muted">Listings abhi load nahi huin. Backend chal raha hai?</p>}
      </section>

      {/* Stats */}
      <section className="container-x pt-24">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-pine-100 bg-pine-100 lg:grid-cols-4">
          {[
            { n: 1200, s: '+', l: 'Families placed' },
            { n: 340, s: '+', l: 'Homes sold & rented' },
            { n: 5, s: '', l: 'Cities covered' },
            { n: 98, s: '%', l: 'Client satisfaction' },
          ].map((s) => (
            <div key={s.l} className="group bg-white p-8 text-center transition-colors duration-300 hover:bg-pine-50">
              <p className="font-display text-5xl font-semibold text-pine-700 transition-transform duration-300 group-hover:scale-110"><Counter to={s.n} suffix={s.s} /></p>
              <p className="mt-2 text-sm font-semibold text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="container-x grid gap-14 pt-28 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h2 className="text-4xl font-semibold leading-tight text-pine-800 sm:text-5xl">Luxury is the little things done right</h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted">From the first call to the day you collect your keys, we remove the friction that makes buying or renting a home feel hard.</p>
          <Link to="/contact" className="btn-primary mt-8">Book a private consultation</Link>
        </Reveal>
        <div className="divide-y divide-pine-100 border-y border-pine-100">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} y={14}>
              <div className="group flex cursor-default items-start gap-5 px-2 py-7 transition-all duration-500 hover:bg-pine-50/70 hover:pl-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-brass-300 bg-white text-brass-500 transition-all duration-500 group-hover:rotate-6 group-hover:bg-pine-700 group-hover:text-brass-300"><f.icon size={24} /></span>
                <div>
                  <h3 className="text-2xl font-semibold text-pine-800">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="container-x pt-28">
        <Reveal><h2 className="text-center text-4xl font-semibold text-pine-800 sm:text-5xl">Three steps to your new address</h2></Reveal>
        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} className="absolute left-[16%] right-[16%] top-8 hidden h-px origin-left bg-brass-300 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.15}>
              <div className="group text-center">
                <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-brass-300 bg-white font-display text-3xl font-semibold text-pine-700 shadow-soft transition-all duration-500 group-hover:-translate-y-1 group-hover:border-pine-700 group-hover:bg-pine-700 group-hover:text-white">{i + 1}</span>
                <h3 className="mt-5 text-2xl font-semibold text-pine-800">{s.t}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x pt-28">
        <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-16">
          <Quote className="mx-auto text-brass-300" size={48} />
          <div className="mx-auto mt-4 min-h-[170px] max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={rev} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45 }}>
                <p className="font-display text-3xl font-medium leading-snug text-pine-800 sm:text-4xl">{reviews[rev].q}</p>
                <p className="mt-6 font-bold text-ink">{reviews[rev].n}</p>
                <p className="text-sm text-muted">{reviews[rev].r}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            {reviews.map((_, i) => (
              <button key={i} aria-label={`Review ${i + 1}`} onClick={() => setRev(i)} className={`h-2 rounded-full transition-all duration-500 ${i === rev ? 'w-8 bg-brass-500' : 'w-2 bg-pine-200 hover:bg-pine-300'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pt-28">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-pine-100 bg-pine-50 p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brass-100 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-4xl font-semibold text-pine-800 sm:text-5xl">Selling or renting out a property?</h2>
              <p className="mt-4 max-w-lg text-muted">List it with Pantrix Estates and reach qualified buyers in five cities. Our market valuation is free.</p>
              <Link to="/contact" className="btn-primary mt-7">Get a free valuation <ArrowRight size={16} /></Link>
            </div>
            <div className="hidden pb-3 pr-3 md:block">
              <Frame src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80" alt="Family home" className="aspect-[4/3] w-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
