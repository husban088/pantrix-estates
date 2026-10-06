import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { createStore } from "./store";
import { seedIfEmpty } from "./seed";
import { signToken, requireAdmin } from "./auth";
import * as svc from "./services";

const app = express();
const store = createStore();
const PORT = Number(process.env.PORT) || 5000;

const cloudOn = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);
if (cloudOn) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
console.log(
  `Image storage: ${cloudOn ? "Cloudinary" : "local (backend/uploads)"}`,
);

// Vercel par file system read-only hota hai, isliye wahan local uploads nahi chalte (Cloudinary zaroori hai)
const onVercel = !!process.env.VERCEL;
const uploadsDir = onVercel
  ? "/tmp/uploads"
  : path.join(__dirname, "..", "uploads");
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch {
  /* ignore */
}

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadsDir));

// Pehli request par sample data (agar database khali ho) ek baar ban jata hai
const ready = seedIfEmpty(store);
app.use("/api", (_req, _res, next) => {
  ready.then(() => next(), next);
});

const ah =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const str = (v: unknown) => String(v ?? "").trim();

function cleanProperty(b: any) {
  return {
    title: str(b.title),
    description: str(b.description),
    type: b.type === "rent" ? "rent" : "sale",
    category: str(b.category) || "House",
    price: num(b.price),
    city: str(b.city),
    area: str(b.area),
    address: str(b.address),
    beds: num(b.beds),
    baths: num(b.baths),
    sqft: num(b.sqft),
    featured: !!b.featured,
    status: ["available", "sold", "rented"].includes(b.status)
      ? b.status
      : "available",
    amenities: Array.isArray(b.amenities)
      ? b.amenities.map(str).filter(Boolean)
      : [],
    images: Array.isArray(b.images) ? b.images.map(str).filter(Boolean) : [],
  };
}

// ---------- public ----------
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    database: store.mode,
    images: cloudOn ? "cloudinary" : "local",
  }),
);

app.get(
  "/api/properties",
  ah(async (req, res) => {
    const { type, category, city, q, beds, max, min, featured, sort } =
      req.query as Record<string, string | undefined>;
    let rows = await store.list("properties");
    if (type) rows = rows.filter((p) => p.type === type);
    if (category) rows = rows.filter((p) => p.category === category);
    if (city)
      rows = rows.filter((p) => p.city.toLowerCase() === city.toLowerCase());
    if (featured) rows = rows.filter((p) => p.featured);
    if (beds) rows = rows.filter((p) => p.beds >= num(beds));
    if (max) rows = rows.filter((p) => p.price <= num(max, Infinity));
    if (min) rows = rows.filter((p) => p.price >= num(min));
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((p) =>
        `${p.title} ${p.city} ${p.area} ${p.address} ${p.category}`
          .toLowerCase()
          .includes(s),
      );
    }
    rows.sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : String(b.createdAt).localeCompare(String(a.createdAt)),
    );
    res.json(rows);
  }),
);

app.get(
  "/api/properties/:id",
  ah(async (req, res) => {
    const p = await store.get("properties", req.params.id);
    return p
      ? res.json(p)
      : res.status(404).json({ error: "Property not found" });
  }),
);

app.post(
  "/api/inquiries",
  ah(async (req, res) => {
    const b = req.body || {};
    const name = str(b.name),
      email = str(b.email),
      message = str(b.message);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message)
      return res
        .status(400)
        .json({ error: "Name, valid email and message are required" });
    const property = b.propertyId
      ? await store.get("properties", str(b.propertyId))
      : null;
    const budget = num(b.budget);
    const phone = str(b.phone);
    const lead = await svc.leadScore(
      budget,
      property?.price || 0,
      phone.length >= 7,
      message.length,
    );
    const row = await store.create("inquiries", {
      name,
      email,
      phone,
      message,
      budget,
      propertyId: property?.id || "",
      propertyTitle: property?.title || "General inquiry",
      status: "new",
      score: lead.score,
      grade: lead.grade,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(row);
  }),
);

app.get(
  "/api/tools/mortgage",
  ah(async (req, res) => {
    const { price, down, rate, years } = req.query;
    res.json(
      await svc.mortgage(num(price), num(down), num(rate, 6), num(years, 20)),
    );
  }),
);
app.get(
  "/api/tools/estimate",
  ah(async (req, res) => {
    const { city, sqft, beds, category } = req.query;
    res.json(
      await svc.estimate(str(city), num(sqft), num(beds), str(category)),
    );
  }),
);

// ---------- admin ----------
app.post("/api/auth/login", (req, res) => {
  const email = str(req.body?.email).toLowerCase();
  const password = str(req.body?.password);
  const okEmail = (
    process.env.ADMIN_EMAIL || "admin@pantrix.com"
  ).toLowerCase();
  const okPass = process.env.ADMIN_PASSWORD || "Admin@123";
  if (email !== okEmail || password !== okPass)
    return res.status(401).json({ error: "Email ya password galat hai" });
  res.json({ token: signToken({ email }), email });
});

app.post(
  "/api/properties",
  requireAdmin,
  ah(async (req, res) => {
    const data = cleanProperty(req.body || {});
    if (!data.title || !data.price || !data.city)
      return res
        .status(400)
        .json({ error: "Title, price and city are required" });
    res
      .status(201)
      .json(
        await store.create("properties", {
          ...data,
          createdAt: new Date().toISOString(),
        }),
      );
  }),
);

app.put(
  "/api/properties/:id",
  requireAdmin,
  ah(async (req, res) => {
    const data = cleanProperty(req.body || {});
    if (!data.title || !data.price || !data.city)
      return res
        .status(400)
        .json({ error: "Title, price and city are required" });
    const row = await store.update("properties", req.params.id, data);
    return row
      ? res.json(row)
      : res.status(404).json({ error: "Property not found" });
  }),
);

app.delete(
  "/api/properties/:id",
  requireAdmin,
  ah(async (req, res) => {
    return (await store.remove("properties", req.params.id))
      ? res.json({ ok: true })
      : res.status(404).json({ error: "Property not found" });
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_r, f, cb) => cb(null, /^image\//.test(f.mimetype)),
});

app.post(
  "/api/upload",
  requireAdmin,
  upload.array("images", 10),
  ah(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length)
      return res.status(400).json({ error: "Koi image select nahi hui" });
    const urls: string[] = [];
    for (const f of files) {
      if (cloudOn) {
        urls.push(
          await new Promise<string>((ok, no) =>
            cloudinary.uploader
              .upload_stream({ folder: "pantrix-estates" }, (e, r) =>
                e || !r
                  ? no(e ?? new Error("Upload failed"))
                  : ok(r.secure_url),
              )
              .end(f.buffer),
          ),
        );
      } else {
        if (onVercel)
          return res
            .status(500)
            .json({
              error:
                "Live site par images ke liye Cloudinary keys set karna zaroori hai",
            });
        const ext =
          (
            {
              "image/png": ".png",
              "image/webp": ".webp",
              "image/gif": ".gif",
              "image/avif": ".avif",
            } as Record<string, string>
          )[f.mimetype] || ".jpg";
        const name = crypto.randomUUID() + ext;
        fs.writeFileSync(path.join(uploadsDir, name), f.buffer);
        urls.push("/uploads/" + name);
      }
    }
    res.json({ urls, storage: cloudOn ? "cloudinary" : "local" });
  }),
);

app.get(
  "/api/inquiries",
  requireAdmin,
  ah(async (_req, res) => {
    const rows = await store.list("inquiries");
    res.json(
      rows.sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt)),
      ),
    );
  }),
);

app.patch(
  "/api/inquiries/:id",
  requireAdmin,
  ah(async (req, res) => {
    const status = ["new", "contacted", "closed"].includes(req.body?.status)
      ? req.body.status
      : "new";
    const row = await store.update("inquiries", req.params.id, { status });
    return row
      ? res.json(row)
      : res.status(404).json({ error: "Inquiry not found" });
  }),
);

app.delete(
  "/api/inquiries/:id",
  requireAdmin,
  ah(async (req, res) => {
    return (await store.remove("inquiries", req.params.id))
      ? res.json({ ok: true })
      : res.status(404).json({ error: "Inquiry not found" });
  }),
);

app.get(
  "/api/tools/commission",
  requireAdmin,
  ah(async (req, res) => {
    res.json(
      await svc.commission(
        num(req.query.price),
        str(req.query.type) === "rent" ? "rent" : "sale",
      ),
    );
  }),
);

app.get(
  "/api/services/status",
  requireAdmin,
  ah(async (_req, res) => res.json(await svc.status())),
);

app.get(
  "/api/stats",
  requireAdmin,
  ah(async (_req, res) => {
    const props = await store.list("properties");
    const inqs = await store.list("inquiries");
    const group = <T>(
      rows: any[],
      key: (r: any) => string,
      val?: (r: any) => number,
    ) => {
      const m = new Map<string, { count: number; value: number }>();
      rows.forEach((r) => {
        const k = key(r);
        const cur = m.get(k) || { count: 0, value: 0 };
        cur.count += 1;
        cur.value += val ? val(r) : 0;
        m.set(k, cur);
      });
      return [...m.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.count - a.count);
    };
    const salePrices = props
      .filter((p) => p.type === "sale")
      .map((p) => p.price);
    const months: { month: string; inquiries: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString("en-US", { month: "short" });
      months.push({
        month: label,
        inquiries: inqs.filter((q) => {
          const c = new Date(q.createdAt);
          return (
            c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear()
          );
        }).length,
      });
    }
    res.json({
      totals: {
        properties: props.length,
        available: props.filter((p) => p.status === "available").length,
        featured: props.filter((p) => p.featured).length,
        inquiries: inqs.length,
        newInquiries: inqs.filter((q) => q.status === "new").length,
        hotLeads: inqs.filter((q) => q.grade === "Hot").length,
        portfolioValue: salePrices.reduce((a, b) => a + b, 0),
        avgSalePrice: salePrices.length
          ? Math.round(
              salePrices.reduce((a, b) => a + b, 0) / salePrices.length,
            )
          : 0,
      },
      byCity: group(
        props,
        (p) => p.city,
        (p) => (p.type === "sale" ? p.price : 0),
      ),
      byCategory: group(props, (p) => p.category),
      byType: group(props, (p) =>
        p.type === "sale" ? "For sale" : "For rent",
      ),
      byStatus: group(inqs, (q) => q.status),
      monthly: months,
      recentInquiries: inqs
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5),
    });
  }),
);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

export { ready };
export default app;

// Local par server chalta hai, Vercel par app ko api/index.ts function use karta hai
if (!onVercel) {
  ready
    .then(() =>
      app.listen(PORT, () =>
        console.log(`API ready: http://localhost:${PORT}/api/health`),
      ),
    )
    .catch((e) => {
      console.error("Startup failed:", e);
      process.exit(1);
    });
}
