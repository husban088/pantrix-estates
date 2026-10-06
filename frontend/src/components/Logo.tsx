import { Link } from 'react-router-dom';
import { BRAND } from '../config';

export default function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-700 shadow-soft transition-transform duration-500 group-hover:rotate-[360deg]">
        <svg viewBox="0 0 64 64" className="h-6 w-6"><path d="M32 12 10 32h7v20h11V38h8v14h11V32h7z" fill="#dcc283" /></svg>
      </span>
      <span className="font-display text-2xl font-semibold leading-none text-pine-800">
        {BRAND.split(' ')[0]}
        <span className="ml-1 text-brass-500">{BRAND.split(' ')[1]}</span>
      </span>
    </Link>
  );
}
