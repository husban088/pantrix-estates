import fs from "fs";
import path from "path";
import crypto from "crypto";
import admin from "firebase-admin";

export type Col = "properties" | "inquiries" | "users";

export interface Store {
  mode: "firestore" | "local";
  list(c: Col): Promise<any[]>;
  get(c: Col, id: string): Promise<any | null>;
  create(c: Col, data: any): Promise<any>;
  update(c: Col, id: string, patch: any): Promise<any | null>;
  remove(c: Col, id: string): Promise<boolean>;
}

function localStore(): Store {
  // Vercel par sirf /tmp likhne layak hota hai (wahan data sthayi nahi hota, isliye Firebase use karein)
  const dir = process.env.VERCEL
    ? "/tmp/pantrix-data"
    : path.join(__dirname, "..", "data");
  const file = path.join(dir, "db.json");
  fs.mkdirSync(dir, { recursive: true });
  let db: Record<Col, any[]> = { properties: [], inquiries: [], users: [] };
  if (fs.existsSync(file)) {
    try {
      db = { ...db, ...JSON.parse(fs.readFileSync(file, "utf8")) };
    } catch {
      /* start fresh */
    }
  }
  const save = () => fs.writeFileSync(file, JSON.stringify(db, null, 2));
  return {
    mode: "local",
    async list(c) {
      return [...db[c]];
    },
    async get(c, id) {
      return db[c].find((x) => x.id === id) || null;
    },
    async create(c, data) {
      const row = { id: crypto.randomUUID(), ...data };
      db[c].push(row);
      save();
      return row;
    },
    async update(c, id, patch) {
      const i = db[c].findIndex((x) => x.id === id);
      if (i < 0) return null;
      db[c][i] = { ...db[c][i], ...patch, id };
      save();
      return db[c][i];
    },
    async remove(c, id) {
      const n = db[c].length;
      db[c] = db[c].filter((x) => x.id !== id);
      save();
      return db[c].length < n;
    },
  };
}

function firestoreStore(): Store {
  const fsdb = admin.firestore();
  fsdb.settings({ ignoreUndefinedProperties: true });
  return {
    mode: "firestore",
    async list(c) {
      const s = await fsdb.collection(c).get();
      return s.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async get(c, id) {
      const d = await fsdb.collection(c).doc(id).get();
      return d.exists ? { id: d.id, ...d.data() } : null;
    },
    async create(c, data) {
      const ref = await fsdb.collection(c).add(data);
      return { id: ref.id, ...data };
    },
    async update(c, id, patch) {
      const ref = fsdb.collection(c).doc(id);
      if (!(await ref.get()).exists) return null;
      await ref.set(patch, { merge: true });
      return { id, ...(await ref.get()).data() };
    },
    async remove(c, id) {
      const ref = fsdb.collection(c).doc(id);
      if (!(await ref.get()).exists) return false;
      await ref.delete();
      return true;
    },
  };
}

export function createStore(): Store {
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail } =
    process.env;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Database: Firebase Firestore");
      return firestoreStore();
    } catch (e) {
      console.warn(
        "Firebase config galat hai, local database use ho raha hai:",
        (e as Error).message,
      );
    }
  }
  console.log("Database: local JSON (backend/data/db.json)");
  return localStore();
}
