import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, delay = 0 }: { icon: React.ElementType; label: string; value: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} className="group rounded-3xl border border-pine-100 bg-white p-5 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-brass-300 hover:shadow-lift">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-50 text-pine-700 transition-all duration-500 group-hover:rotate-6 group-hover:bg-pine-700 group-hover:text-brass-300"><Icon size={20} /></span>
      <p className="mt-4 text-3xl font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </motion.div>
  );
}

export function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-pine-100 bg-white p-6 shadow-soft ${className}`}>
      <h3 className="text-2xl font-semibold text-pine-800">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-pine-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div onMouseDown={(e) => e.stopPropagation()} initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-pine-100 px-6 py-4">
              <h2 className="text-3xl font-semibold text-pine-800">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-pine-200 text-muted transition hover:rotate-90 hover:border-brass-500 hover:text-pine-700"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Toast({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-brass-300 bg-white px-6 py-3 text-sm font-semibold text-pine-800 shadow-lift">
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
