import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

/** Plain credential check (NextAuth uses lib/auth.ts; this stays for API clients). */
export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/auth/verify-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.detail ?? "Invalid credentials" }, { status: res.status });
    }
    return NextResponse.json({ message: "Login successful", user: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not reach the backend" }, { status: 502 });
  }
}
