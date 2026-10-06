import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { api } from '../api';
import { Property } from '../types';
import { CATEGORIES, CITIES } from '../config';
import Img from './Img';

type Form = {
  title: string; description: string; type: 'sale' | 'rent'; category: string; price: string; city: string; area: string; address: string;
  beds: string; baths: string; sqft: string; featured: boolean; status: Property['status']; amenities: string; images: string[];
};

const blank: Form = { title: '', description: '', type: 'sale', category: 'House', price: '', city: 'Islamabad', area: '', address: '', beds: '3', baths: '2', sqft: '', featured: false, status: 'available', amenities: '', images: [] };

export default function PropertyForm({ initial, onSaved }: { initial: Property | null; onSaved: (msg: string) => void }) {
  const [f, setF] = useState<Form>(() =>
    initial ? { ...blank, ...initial, price: String(initial.price), beds: String(initial.beds), baths: String(initial.baths), sqft: String(initial.sqft), amenities: initial.amenities.join(', ') } : blank,
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [url, setUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setErr('');
    try {
      const r = await api.upload(Array.from(files));
      setF((s) => ({ ...s, images: [...s.images, ...r.urls] }));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const body = { ...f, price: Number(f.price), beds: Number(f.beds), baths: Number(f.baths), sqft: Number(f.sqft), amenities: f.amenities.split(',').map((a) => a.trim()).filter(Boolean) };
    try {
      if (initial) await api.put(`/properties/${initial.id}`, body); else await api.post('/properties', body);
      onSaved(initial ? 'Property updated' : 'Property added');
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div><label className="label">Title</label><input className="field" required value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Marble Crest Villa" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Listing type</label><select className="field" value={f.type} onChange={(e) => set('type', e.target.value as 'sale' | 'rent')}><option value="sale">For sale</option><option value="rent">For rent (monthly)</option></select></div>
        <div><label className="label">Category</label><select className="field" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">Price</label><input className="field" type="number" min="1" required value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="500000" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">City</label><input className="field" list="cities" required value={f.city} onChange={(e) => set('city', e.target.value)} /><datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist></div>
        <div><label className="label">Area</label><input className="field" value={f.area} onChange={(e) => set('area', e.target.value)} placeholder="F-7 Markaz" /></div>
        <div><label className="label">Status</label><select className="field" value={f.status} onChange={(e) => set('status', e.target.value as Property['status'])}><option value="available">Available</option><option value="sold">Sold</option><option value="rented">Rented</option></select></div>
      </div>
      <div><label className="label">Full address</label><input className="field" value={f.address} onChange={(e) => set('address', e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Bedrooms</label><input className="field" type="number" min="0" value={f.beds} onChange={(e) => set('beds', e.target.value)} /></div>
        <div><label className="label">Bathrooms</label><input className="field" type="number" min="0" value={f.baths} onChange={(e) => set('baths', e.target.value)} /></div>
        <div><label className="label">Area (sqft)</label><input className="field" type="number" min="0" value={f.sqft} onChange={(e) => set('sqft', e.target.value)} /></div>
      </div>
      <div><label className="label">Description</label><textarea className="field min-h-[110px]" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
      <div><label className="label">Amenities (comma separated)</label><input className="field" value={f.amenities} onChange={(e) => set('amenities', e.target.value)} placeholder="Pool, Gym, Garden" /></div>

      <div>
        <label className="label">Photos</label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {f.images.map((src, i) => (
            <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-pine-100">
              <Img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-pine-700">Cover</span>}
              <button type="button" aria-label="Remove photo" onClick={() => set('images', f.images.filter((_, j) => j !== i))} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-pine-200 text-muted transition hover:border-brass-500 hover:bg-pine-50 hover:text-pine-700">
            <span className="flex flex-col items-center gap-1 text-xs font-semibold">{uploading ? <Loader2 className="animate-spin" size={22} /> : <ImagePlus size={22} />}{uploading ? 'Uploading' : 'Upload'}</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <div className="mt-3 flex gap-2">
          <input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Or paste an image link (https://...)" />
          <button type="button" className="btn-outline shrink-0" onClick={() => { if (/^https?:\/\//.test(url.trim())) { set('images', [...f.images, url.trim()]); setUrl(''); } }}>Add</button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-pine-100 px-4 py-3 text-sm font-semibold transition hover:bg-pine-50">
        <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Show on the home page as featured
      </label>

      {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary w-full" disabled={busy || uploading}>{busy ? 'Saving...' : initial ? 'Save changes' : 'Add property'}</button>
    </form>
  );
}
