import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import type { Store } from "./store";
import { signToken, requireUser, hashPassword, checkPassword } from "./auth";

const str = (v: unknown) => String(v ?? "").trim();
const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);
const MIN_PASSWORD = 6;

// password aur reset fields kabhi frontend ko nahi jate
function publicUser(u: any) {
  const { password, resetHash, resetExpires, ...rest } = u;
  return rest;
}

const ah =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

export function userRoutes(store: Store) {
  const r = Router();

  const findByEmail = async (email: string) =>
    (await store.list("users")).find((u) => u.email === email.toLowerCase()) ||
    null;

  const session = (u: any) => ({
    token: signToken({ id: u.id, email: u.email, role: "user" }, 24 * 7),
    user: publicUser(u),
  });

  // ---------- signup ----------
  r.post(
    "/auth/signup",
    ah(async (req, res) => {
      const b = req.body || {};
      const name = str(b.name);
      const email = str(b.email).toLowerCase();
      const phone = str(b.phone);
      const password = str(b.password);
      if (!name) return res.status(400).json({ error: "Name zaroori hai" });
      if (!emailOk(email))
        return res.status(400).json({ error: "Sahi email likhein" });
      if (password.length < MIN_PASSWORD)
        return res
          .status(400)
          .json({
            error: `Password kam az kam ${MIN_PASSWORD} characters ka hona chahiye`,
          });
      if (password !== str(b.confirmPassword))
        return res
          .status(400)
          .json({ error: "Password aur confirm password match nahi karte" });
      if (await findByEmail(email))
        return res
          .status(409)
          .json({ error: "Is email se account pehle se bana hua hai" });
      const now = new Date().toISOString();
      const user = await store.create("users", {
        name,
        email,
        phone,
        city: "",
        bio: "",
        password: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      });
      res.status(201).json(session(user));
    }),
  );

  // ---------- login ----------
  r.post(
    "/auth/user-login",
    ah(async (req, res) => {
      const email = str(req.body?.email).toLowerCase();
      const password = str(req.body?.password);
      const user = await findByEmail(email);
      if (!user || !checkPassword(password, user.password))
        return res.status(401).json({ error: "Email ya password galat hai" });
      res.json(session(user));
    }),
  );

  // ---------- forgot password ----------
  // Email service abhi connected nahi hai, isliye reset code response me wapas aata hai (demo mode).
  // Live site par email bhejna ho to RESET_SHOW_CODE=false karein aur email bhejne ka code jodein.
  r.post(
    "/auth/forgot-password",
    ah(async (req, res) => {
      const email = str(req.body?.email).toLowerCase();
      if (!emailOk(email))
        return res.status(400).json({ error: "Sahi email likhein" });
      const demo = process.env.RESET_SHOW_CODE !== "false";
      const user = await findByEmail(email);
      if (!user) {
        if (demo)
          return res
            .status(404)
            .json({ error: "Is email se koi account nahi mila" });
        return res.json({ ok: true });
      }
      const code = String(crypto.randomInt(100000, 1000000));
      await store.update("users", user.id, {
        resetHash: crypto.createHash("sha256").update(code).digest("hex"),
        resetExpires: Date.now() + 15 * 60_000,
      });
      res.json(demo ? { ok: true, code } : { ok: true });
    }),
  );

  // ---------- reset password ----------
  r.post(
    "/auth/reset-password",
    ah(async (req, res) => {
      const b = req.body || {};
      const email = str(b.email).toLowerCase();
      const code = str(b.code);
      const password = str(b.password);
      if (password.length < MIN_PASSWORD)
        return res
          .status(400)
          .json({
            error: `Password kam az kam ${MIN_PASSWORD} characters ka hona chahiye`,
          });
      if (password !== str(b.confirmPassword))
        return res
          .status(400)
          .json({ error: "Password aur confirm password match nahi karte" });
      const user = await findByEmail(email);
      const hash = crypto.createHash("sha256").update(code).digest("hex");
      if (
        !user ||
        !user.resetHash ||
        user.resetHash !== hash ||
        Number(user.resetExpires) < Date.now()
      )
        return res
          .status(400)
          .json({ error: "Reset code galat ya expire ho chuka hai" });
      await store.update("users", user.id, {
        password: hashPassword(password),
        resetHash: "",
        resetExpires: 0,
        updatedAt: new Date().toISOString(),
      });
      res.json({ ok: true });
    }),
  );

  // ---------- profile ----------
  r.get(
    "/me",
    requireUser,
    ah(async (req, res) => {
      const user = await store.get("users", (req as any).userId);
      return user
        ? res.json(publicUser(user))
        : res
            .status(401)
            .json({ error: "Account nahi mila, dobara login karein" });
    }),
  );

  r.put(
    "/me",
    requireUser,
    ah(async (req, res) => {
      const b = req.body || {};
      const name = str(b.name);
      if (!name) return res.status(400).json({ error: "Name zaroori hai" });
      const row = await store.update("users", (req as any).userId, {
        name,
        phone: str(b.phone),
        city: str(b.city),
        bio: str(b.bio).slice(0, 300),
        updatedAt: new Date().toISOString(),
      });
      return row
        ? res.json(publicUser(row))
        : res
            .status(401)
            .json({ error: "Account nahi mila, dobara login karein" });
    }),
  );

  r.put(
    "/me/password",
    requireUser,
    ah(async (req, res) => {
      const b = req.body || {};
      const user = await store.get("users", (req as any).userId);
      if (!user)
        return res
          .status(401)
          .json({ error: "Account nahi mila, dobara login karein" });
      if (!checkPassword(str(b.currentPassword), user.password))
        return res.status(400).json({ error: "Current password galat hai" });
      const next = str(b.newPassword);
      if (next.length < MIN_PASSWORD)
        return res
          .status(400)
          .json({
            error: `Naya password kam az kam ${MIN_PASSWORD} characters ka hona chahiye`,
          });
      if (next !== str(b.confirmPassword))
        return res
          .status(400)
          .json({
            error: "Naya password aur confirm password match nahi karte",
          });
      await store.update("users", user.id, {
        password: hashPassword(next),
        updatedAt: new Date().toISOString(),
      });
      res.json({ ok: true });
    }),
  );

  r.delete(
    "/me",
    requireUser,
    ah(async (req, res) => {
      await store.remove("users", (req as any).userId);
      res.json({ ok: true });
    }),
  );

  return r;
}
