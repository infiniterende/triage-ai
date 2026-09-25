import { notFound } from "next/navigation";
import PatientChart from "../../../components/clinician/PatientChart";

export default async function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patientId = Number(id);
  if (!Number.isFinite(patientId)) notFound();
  return <PatientChart patientId={patientId} />;
}
