import type { IncomingMessage, ServerResponse } from "http";
import app, { ready } from "../backend/src/server";

// Vercel serverless function: saari /api/* requests yahin se Express app ko jati hain
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  await ready;
  (app as unknown as (a: IncomingMessage, b: ServerResponse) => void)(req, res);
}
