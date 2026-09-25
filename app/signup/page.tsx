"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";

const SPECIALTIES = [
  { value: "cardiology", label: "Cardiology" },
  { value: "general", label: "General medicine" },
  { value: "emergency", label: "Emergency medicine" },
  { value: "neurology", label: "Neurology" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "orthopedics", label: "Orthopedics" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.specialty) {
      setError("Please select your specialty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        res.status === 409
          ? "An account with that email already exists."
          : data?.message || "Registration failed. Please try again.",
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Join Agilance to see your patients' assessments in one prioritised view."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-5" noValidate>
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => update("name")(e.target.value)}
            placeholder="Dr. Jane Smith"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email")(e.target.value)}
            placeholder="you@clinic.org"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="specialty" className="field-label">
            Specialty
          </label>
          <select
            id="specialty"
            required
            value={form.specialty}
            onChange={(e) => update("specialty")(e.target.value)}
            className="field-input appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2364748b%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px_16px] bg-[right_0.9rem_center] bg-no-repeat pr-10"
          >
            <option value="">Select a specialty</option>
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password")(e.target.value)}
            placeholder="At least 8 characters"
            className="field-input"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 text-[15px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          By creating an account you agree to keep patient data confidential in
          line with your organisation&apos;s policies.
        </p>
      </form>
    </AuthLayout>
  );
}
