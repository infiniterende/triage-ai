import { redirect } from "next/navigation";

/** Legacy route — the assessment now lives at /assessment. */
export default function TriagePage() {
  redirect("/assessment");
}
