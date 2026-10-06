import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from 'lucide-react';
import Img from './Img';
import { Property } from '../types';
import { money } from '../utils';

export default function PropertyCard({ p, index = 0 }: { p: Property; index?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 220, damping: 22 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <Link to={`/properties/${p.id}`} className="group block overflow-hidden rounded-3xl border border-pine-100 bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift">
        <div className="sheen relative aspect-[4/3] overflow-hidden">
          <Img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-900/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur ${p.type === 'sale' ? 'bg-white/95 text-pine-700' : 'bg-brass-100/95 text-brass-600'}`}>
            {p.type === 'sale' ? 'For sale' : 'For rent'}
          </span>
          {p.status !== 'available' && <span className="absolute right-4 top-4 rounded-full bg-pine-700 px-3.5 py-1.5 text-xs font-bold capitalize text-white">{p.status}</span>}
          <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-white text-pine-700 opacity-0 shadow-soft transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brass-600"><MapPin size={14} /> {p.area}, {p.city}</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-pine-800 transition-colors group-hover:text-brass-600">{p.title}</h3>
          <p className="mt-2 text-xl font-bold text-ink">{money(p.price, p.type)}</p>
          <div className="mt-5 flex items-center gap-5 border-t border-pine-100 pt-4 text-sm text-muted">
            {p.beds > 0 && <span className="flex items-center gap-1.5"><Bed size={16} className="text-pine-500" /> {p.beds}</span>}
            {p.baths > 0 && <span className="flex items-center gap-1.5"><Bath size={16} className="text-pine-500" /> {p.baths}</span>}
            <span className="flex items-center gap-1.5"><Maximize size={16} className="text-pine-500" /> {p.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
