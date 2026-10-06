import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { PANTRIX_URL, CITIES } from '../config';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-pine-100 bg-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Handpicked villas, penthouses and family homes across Islamabad, Lahore, Karachi, Dubai and London, with advisors who stay with you from the first viewing to the final signature.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-pine-800">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link className="link-line hover:text-pine-700" to="/properties">All properties</Link></li>
            <li><Link className="link-line hover:text-pine-700" to="/properties?type=sale">Homes for sale</Link></li>
            <li><Link className="link-line hover:text-pine-700" to="/properties?type=rent">Homes for rent</Link></li>
            {CITIES.slice(0, 3).map((c) => (
              <li key={c}><Link className="link-line hover:text-pine-700" to={`/properties?city=${c}`}>{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-pine-800">Talk to us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5"><Phone size={16} className="text-brass-500" /> +92 300 000 0000</li>
            <li className="flex items-center gap-2.5"><Mail size={16} className="text-brass-500" /> hello@pantrixestates.com</li>
            <li className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-brass-500" /> Blue Area, Islamabad, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-pine-100">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Pantrix Estates. All rights reserved.</p>
          <p>
            This website was built by{' '}
            <a href={PANTRIX_URL} target="_blank" rel="noopener noreferrer" className="link-line font-semibold text-pine-700 transition hover:text-brass-600">
              Pantrix
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
