import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

/** Clinician sign-up: proxied to the backend, which owns the doctors table. */
export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string; specialty?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  if (!BACKEND_URL) {
    return NextResponse.json({ message: "Backend URL is not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ message: data.detail ?? "Registration failed" }, { status: res.status });
    }
    return NextResponse.json({ message: "User created", user: data }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Could not reach the backend" }, { status: 502 });
  }
}
