import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import InquiryForm from '../components/InquiryForm';

const info = [
  { i: Phone, t: 'Call us', d: '+92 300 000 0000' },
  { i: Mail, t: 'Email', d: 'hello@pantrixestates.com' },
  { i: MapPin, t: 'Visit', d: 'Blue Area, Islamabad, Pakistan' },
  { i: Clock, t: 'Hours', d: 'Mon to Sat, 9am to 7pm' },
];

export default function Contact() {
  return (
    <div className="container-x pt-12">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <h1 className="text-5xl font-semibold text-pine-800 sm:text-6xl">Let's find your next address</h1>
        <p className="mt-3 text-muted">Tell us what you are looking for. A senior advisor replies within one working day.</p>
      </motion.div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {info.map((x, i) => (
            <motion.div key={x.t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="group flex items-center gap-5 rounded-3xl border border-pine-100 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brass-300 hover:shadow-lift">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine-50 text-pine-700 transition-all duration-500 group-hover:rotate-6 group-hover:bg-pine-700 group-hover:text-brass-300"><x.i size={22} /></span>
              <div><p className="text-xs font-semibold text-muted">{x.t}</p><p className="text-lg font-bold text-ink">{x.d}</p></div>
            </motion.div>
          ))}
        </div>
        <InquiryForm title="Send us a message" cta="Send message" />
      </div>
    </div>
  );
}
