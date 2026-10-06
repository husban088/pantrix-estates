import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const secret = () => process.env.JWT_SECRET || "pantrix-dev-secret";

export function signToken(payload: object, hours = 12): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + hours * 3600_000 }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(
  token: string,
): { email: string; id?: string; role?: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const good = crypto
    .createHmac("sha256", secret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

// ---------- password hashing (scrypt, koi extra package nahi chahiye) ----------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = crypto.scryptSync(password, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // REQUIRE_LOGIN=true karne par hi login zaroori hota hai. Default: dashboard sab ke liye khula hai.
  if (process.env.REQUIRE_LOGIN !== "true") return next();
  const h = req.headers.authorization || "";
  const user = h.startsWith("Bearer ") ? verifyToken(h.slice(7)) : null;
  // normal website users (role: 'user') admin nahi hain
  if (!user || user.role === "user")
    return res.status(401).json({ error: "Login required" });
  next();
}

// Sirf login kiye hue website users ke liye (profile wale routes)
export function requireUser(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const user = h.startsWith("Bearer ") ? verifyToken(h.slice(7)) : null;
  if (!user || user.role !== "user" || !user.id)
    return res.status(401).json({ error: "Please login first" });
  (req as any).userId = user.id;
  next();
}
