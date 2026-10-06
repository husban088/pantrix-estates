import Img from './Img';

/** Luxury frame: rounded photo with an offset brass outline that glides on hover. */
export default function Frame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`group relative ${className}`}>
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl border border-brass-400 transition-transform duration-700 ease-out group-hover:translate-x-5 group-hover:translate-y-5" />
      <div className="sheen relative h-full w-full overflow-hidden rounded-3xl shadow-lift">
        <Img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110" />
      </div>
    </div>
  );
}
