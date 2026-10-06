import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Img from './Img';

const ease = [0.22, 1, 0.36, 1] as const;
const DURATION = 5800;

const slides = [
  { src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', title: 'Marble Crest Villa', place: 'F-7, Islamabad', price: '$1,850,000', city: 'Islamabad' },
  { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', title: 'Skyline Penthouse', place: 'Downtown, Dubai', price: '$2,900,000', city: 'Dubai' },
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', title: 'Garden Terrace Residence', place: 'DHA Phase 6, Lahore', price: '$760,000', city: 'Lahore' },
];
const inset = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80';

export default function HeroShowcase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [i]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), spring);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), spring);
  const fx = useSpring(useTransform(mx, [-0.5, 0.5], [16, -16]), spring);
  const fy = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), spring);
  const s = slides[i];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.35, ease }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="group relative mx-auto w-full max-w-[500px] pb-5 pr-5 md:pl-6 lg:ml-auto lg:mr-0"
    >
      <motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }} className="relative">
        <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] border border-brass-400 transition-transform duration-700 ease-out group-hover:translate-x-6 group-hover:translate-y-6" />

        <div className="sheen relative aspect-[4/5] overflow-hidden rounded-[28px] bg-pine-50 shadow-lift">
          <AnimatePresence initial={false}>
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              exit={{ opacity: 0, transition: { delay: 1.3, duration: 0.01 } }}
              transition={{ duration: 1.2, ease }}
            >
              <motion.div className="h-full w-full" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 7, ease: 'easeOut' }}>
                <Img src={s.src} alt={s.title} className="h-full w-full object-cover" />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-pine-900/50 to-transparent" />

          <div className="absolute inset-x-5 top-5 z-20 flex gap-2">
            {slides.map((_, n) => (
              <button key={n} aria-label={`Show home ${n + 1}`} onClick={() => setI(n)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/50">
                {n === i && <motion.span key={i} className="block h-full rounded-full bg-white" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />}
                {n < i && <span className="block h-full w-full rounded-full bg-white" />}
              </button>
            ))}
          </div>

          <Link to={`/properties?city=${s.city}`} className="group/cap absolute inset-x-5 bottom-5 z-20 overflow-hidden rounded-2xl bg-white/92 p-4 shadow-soft backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-white">
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-brass-600"><MapPin size={13} /> {s.place}</p>
                  <p className="mt-1 truncate font-display text-2xl font-semibold leading-tight text-pine-800">{s.title}</p>
                  <p className="text-sm font-bold text-ink">{s.price}</p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pine-700 text-white transition-all duration-500 group-hover/cap:rotate-45 group-hover/cap:bg-brass-500"><ArrowUpRight size={18} /></span>
              </motion.div>
            </AnimatePresence>
          </Link>
        </div>
      </motion.div>

      <motion.div style={{ x: fx, y: fy }} className="absolute -left-2 top-[30%] z-30 hidden md:block lg:-left-10">
        <div className="animate-floaty">
          <div className="sheen group/in aspect-[3/4] w-32 overflow-hidden rounded-2xl border-4 border-white shadow-lift lg:w-36">
            <Img src={inset} alt="Interior" className="h-full w-full object-cover transition-transform duration-1000 group-hover/in:scale-110" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
