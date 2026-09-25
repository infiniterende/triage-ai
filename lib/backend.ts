/**
 * Server-side base URL of the FastAPI backend. `BACKEND_URL` lets server code
 * reach the API over a private network; it falls back to the public endpoint
 * the browser uses.
 */
export const BACKEND_URL = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_ENDPOINT ??
  ""
).replace(/\/+$/, "");
