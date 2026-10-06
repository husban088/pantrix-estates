import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-300 ${scrolled ? 'border-b border-pine-100 shadow-soft' : 'border-b border-transparent'}`}>
      <div className="container-x flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `link-line text-sm font-semibold transition-colors ${isActive ? 'text-pine-700 after:scale-x-100' : 'text-muted hover:text-pine-700'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link to="/dashboard" className="btn-primary"><LayoutDashboard size={16} /> Dashboard</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-pine-200 text-pine-700 transition hover:border-brass-500 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-pine-100 bg-white md:hidden">
            <div className="container-x flex flex-col gap-1 py-4">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `rounded-xl px-4 py-3 text-base font-semibold transition ${isActive ? 'bg-pine-50 text-pine-700' : 'text-muted hover:bg-pine-50'}`}>
                  {l.label}
                </NavLink>
              ))}
              <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary mt-2"><LayoutDashboard size={16} /> Dashboard</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
