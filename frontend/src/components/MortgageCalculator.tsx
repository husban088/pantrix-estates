import { useEffect, useState } from 'react';
import { api } from '../api';
import { money } from '../utils';

interface Result { monthly: number; principal: number; totalPaid: number; totalInterest: number; source: string }

function Slider({ label, value, set, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; unit: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-muted"><span>{label}</span><span className="text-pine-700">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-pine-100 accent-pine-700" />
    </div>
  );
}

export default function MortgageCalculator({ price }: { price: number }) {
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [res, setRes] = useState<Result | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get<Result>(`/tools/mortgage?price=${price}&down=${Math.round((price * down) / 100)}&rate=${rate}&years=${years}`).then(setRes).catch(() => setRes(null));
    }, 250);
    return () => clearTimeout(t);
  }, [price, down, rate, years]);

  return (
    <div className="card p-6">
      <h3 className="text-2xl font-semibold text-pine-800">Monthly payment</h3>
      <div className="mt-5 space-y-4">
        <Slider label="Down payment" value={down} set={setDown} min={0} max={80} step={5} unit="%" />
        <Slider label="Interest rate" value={rate} set={setRate} min={1} max={20} step={0.5} unit="%" />
        <Slider label="Term" value={years} set={setYears} min={5} max={30} step={1} unit=" years" />
      </div>
      <div className="mt-6 rounded-2xl bg-pine-50 p-5">
        <p className="text-xs font-semibold text-muted">You would pay about</p>
        <p className="mt-1 text-4xl font-bold text-pine-700">{res ? money(res.monthly) : '...'}<span className="text-base font-semibold text-muted"> / month</span></p>
        {res && <p className="mt-2 text-xs text-muted">Total interest {money(res.totalInterest)} · calculated by {res.source}</p>}
      </div>
    </div>
  );
}
