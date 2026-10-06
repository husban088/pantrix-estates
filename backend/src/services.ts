// Python / Java / .NET microservices. Band hon to Node ke andar fallback calculation chalti hai.
const PY = () => process.env.PYTHON_URL || 'http://localhost:8001';
const JV = () => process.env.JAVA_URL || 'http://localhost:8002';
const NET = () => process.env.DOTNET_URL || 'http://localhost:8003';

async function call(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

export async function mortgage(price: number, down: number, rate: number, years: number) {
  const remote = await call(`${PY()}/mortgage?price=${price}&down=${down}&rate=${rate}&years=${years}`);
  if (remote) return { ...remote, source: 'python' };
  const principal = Math.max(price - down, 0);
  const r = rate / 100 / 12;
  const n = Math.max(years, 1) * 12;
  const monthly = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return {
    monthly: Math.round(monthly),
    principal,
    totalPaid: Math.round(monthly * n),
    totalInterest: Math.round(monthly * n - principal),
    source: 'node',
  };
}

const CITY_RATE: Record<string, number> = { dubai: 420, london: 520, islamabad: 150, lahore: 120, karachi: 110 };

export async function estimate(city: string, sqft: number, beds: number, category: string) {
  const remote = await call(
    `${PY()}/estimate?city=${encodeURIComponent(city)}&sqft=${sqft}&beds=${beds}&category=${encodeURIComponent(category)}`,
  );
  if (remote) return { ...remote, source: 'python' };
  const perSqft = (CITY_RATE[city.toLowerCase()] || 140) * (category === 'Penthouse' ? 1.5 : category === 'Villa' ? 1.25 : 1);
  const value = Math.round(perSqft * sqft * (1 + Math.min(beds, 8) * 0.02));
  return { estimate: value, low: Math.round(value * 0.92), high: Math.round(value * 1.08), perSqft: Math.round(perSqft), source: 'node' };
}

export async function commission(price: number, type: string) {
  const remote = await call(`${JV()}/commission?price=${price}&type=${type}`);
  if (remote) return { ...remote, source: 'java' };
  const rate = type === 'rent' ? 8.33 : 2;
  const total = Math.round((price * rate) / 100);
  const agent = Math.round(total * 0.6);
  return { rate, total, agent, agency: total - agent, source: 'node' };
}

export async function leadScore(budget: number, price: number, hasPhone: boolean, messageLength: number) {
  const remote = await call(`${NET()}/lead-score?budget=${budget}&price=${price}&hasPhone=${hasPhone}&messageLength=${messageLength}`);
  if (remote) return { ...remote, source: 'dotnet' };
  let score = 20;
  if (hasPhone) score += 25;
  if (messageLength > 60) score += 15;
  if (budget > 0 && price > 0) score += budget >= price ? 40 : budget >= price * 0.8 ? 25 : 5;
  score = Math.min(score, 100);
  return { score, grade: score >= 70 ? 'Hot' : score >= 45 ? 'Warm' : 'Cold', source: 'node' };
}

export async function status() {
  const [py, jv, net] = await Promise.all([call(`${PY()}/health`), call(`${JV()}/health`), call(`${NET()}/health`)]);
  return [
    { name: 'Python valuation', tech: 'Flask', port: 8001, online: !!py },
    { name: 'Java commission', tech: 'Java 17+', port: 8002, online: !!jv },
    { name: '.NET lead score', tech: 'C# / .NET 8', port: 8003, online: !!net },
  ];
}
