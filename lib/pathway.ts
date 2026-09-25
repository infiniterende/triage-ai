/**
 * TypeScript mirror of the backend clinical pathway engine output
 * (backend/pathways/engine.py → PathwayResult.to_dict()).
 */

export type DispositionLevel = "emergency" | "urgent" | "prompt" | "routine";
export type Likelihood = "unlikely" | "possible" | "likely" | "high";

export type PathwayId =
  | "acs"
  | "arrhythmia"
  | "heart_failure"
  | "hypertensive"
  | "pulmonary_embolism"
  | "aortic"
  | "pericarditis"
  | "syncope";

export interface RedFlag {
  code: string;
  label: string;
  rationale: string;
  severity: "emergency" | "urgent";
}

export interface ConditionAssessment {
  pathway: PathwayId | string;
  name: string;
  score: number;
  likelihood: Likelihood;
  disposition: DispositionLevel;
  supporting: string[];
  against: string[];
  missing: string[];
  summary: string;
  extra?: Record<string, unknown>;
}

export interface DispositionRecommendation {
  level: DispositionLevel;
  headline: string;
  timeframe: string;
  patient_message: string;
  actions: string[];
  scheduling: "same_day" | "within_72_hours" | "routine" | null;
  reasons: string[];
  clinician_summary: string;
}

export interface ChronicPathway {
  pathway: string;
  name: string;
  status: "ok" | "active" | "insufficient_data" | "not_applicable" | "unknown";
  summary: string;
  probability?: number | null;
  band?: "low" | "intermediate" | "high" | "very_high" | null;
  guidance?: string;
  bp_stage?: string | null;
  target?: string;
  recommendations?: string[];
  chest_pain_type?: string | null;
  risk_factors?: Record<string, boolean | null>;
  comorbidities?: string[];
  notes?: string[];
  missing?: string[];
}

export interface ChestPainFindings {
  present: boolean | null;
  quality: string | null;
  location: string | null;
  radiation: string[];
  ongoing: boolean | null;
  duration_minutes: number | null;
  sudden_onset: boolean | null;
  exertional: boolean | null;
  relieved_by_rest: boolean | null;
  relieved_by_nitroglycerin: boolean | null;
  positional: boolean | null;
  pleuritic: boolean | null;
  reproducible_on_palpation: boolean | null;
  severity: number | null;
  worst_ever: boolean | null;
}

export interface ClinicalFindings {
  age: number | null;
  sex: "male" | "female" | null;
  chief_complaint: string | null;
  chest_pain: ChestPainFindings;
  symptoms: Record<string, boolean | null>;
  history: Record<string, boolean | null>;
  vitals: Record<string, number | null>;
  medications: string[];
  notes: string | null;
}

export interface PathwayResult {
  engine_version: string;
  evaluated_at: string;
  findings: ClinicalFindings;
  red_flags: RedFlag[];
  primary_pathway: ConditionAssessment | null;
  pathways: ConditionAssessment[];
  chronic_pathways: ChronicPathway[];
  disposition: DispositionRecommendation;
  next_questions: string[];
  risk_percent: number | null;
  evaluation_id?: number;
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

export const DISPOSITION_META: Record<
  DispositionLevel,
  { label: string; short: string; tone: string; dot: string; bar: string }
> = {
  emergency: {
    label: "Emergency — call 911",
    short: "Emergency",
    tone: "bg-rose-50 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  urgent: {
    label: "Urgent — same-day care",
    short: "Urgent",
    tone: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  prompt: {
    label: "See a clinician within 1–3 days",
    short: "Prompt",
    tone: "bg-brand-50 text-brand-800 ring-brand-200",
    dot: "bg-brand-500",
    bar: "bg-brand-500",
  },
  routine: {
    label: "Routine follow-up",
    short: "Routine",
    tone: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
};

export const LIKELIHOOD_META: Record<Likelihood, { label: string; tone: string }> = {
  high: { label: "High", tone: "bg-rose-50 text-rose-700 ring-rose-600/15" },
  likely: { label: "Likely", tone: "bg-amber-50 text-amber-700 ring-amber-600/15" },
  possible: { label: "Possible", tone: "bg-brand-50 text-brand-700 ring-brand-600/15" },
  unlikely: { label: "Unlikely", tone: "bg-slate-50 text-slate-500 ring-slate-200/70" },
};

export const PATHWAY_CATALOG: { id: PathwayId; name: string; description: string }[] = [
  {
    id: "acs",
    name: "Acute coronary syndrome / ischemia",
    description:
      "Heart attack and unstable angina. Pressure-type chest pain, exertional trigger, radiation to arm or jaw, sweating and cardiovascular risk factors.",
  },
  {
    id: "arrhythmia",
    name: "Arrhythmia",
    description:
      "Abnormal heart rhythms including atrial fibrillation, SVT and bradyarrhythmias. Palpitations, irregular heartbeat, dizziness or fainting.",
  },
  {
    id: "heart_failure",
    name: "Heart failure",
    description:
      "New or worsening heart failure. Breathlessness on exertion or lying flat, waking at night gasping, leg swelling, rapid weight gain and fatigue.",
  },
  {
    id: "hypertensive",
    name: "Hypertensive emergency / urgency",
    description:
      "Severely elevated blood pressure (≥180/120). An emergency when there is organ damage — headache, vision change, confusion, chest pain or breathlessness.",
  },
  {
    id: "pulmonary_embolism",
    name: "Pulmonary embolism",
    description:
      "Blood clot in the lung. Sudden breathlessness, sharp pain worse on breathing, fast heart rate, coughing blood, a swollen calf, or recent surgery or immobility.",
  },
  {
    id: "aortic",
    name: "Aortic emergency",
    description:
      "Aortic dissection or rupturing aneurysm. Abrupt, severe tearing or ripping pain that radiates to the back, often with very high blood pressure.",
  },
  {
    id: "pericarditis",
    name: "Pericarditis / myocarditis",
    description:
      "Inflammation of the heart lining or muscle, often after a viral illness. Sharp pain that is worse lying flat and eased by sitting forward, with fever.",
  },
  {
    id: "syncope",
    name: "Syncope / structural disease",
    description:
      "Fainting or near-fainting that may be cardiac in origin, including valve disease and cardiomyopathy. Exertional syncope and a family history of sudden death are the most worrying features.",
  },
];

export const CHRONIC_CATALOG = [
  {
    id: "cad_risk",
    name: "Coronary artery disease risk",
    description:
      "Pre-test probability of obstructive coronary artery disease from age, sex, chest-pain typicality and risk factors (CAD Consortium clinical model).",
  },
  {
    id: "hypertension_management",
    name: "Hypertension",
    description: "Blood-pressure staging (ACC/AHA 2017), targets and home-monitoring plan.",
  },
  {
    id: "diabetes_cardiometabolic",
    name: "Diabetes & cardiometabolic risk",
    description:
      "Diabetes-driven cardiovascular risk: silent ischemia, atypical presentations and the need for tight blood-pressure, lipid and glucose control.",
  },
];

export const PIPELINE_STEPS = [
  { id: "input", label: "Voice / text conversation", detail: "Patient talks or types with the Agilance agent." },
  { id: "extract", label: "Symptom + history extraction", detail: "Structured findings (tri-state: present / absent / not asked)." },
  { id: "safety", label: "Safety / red-flag layer", detail: "Any emergency red flag stops the interview and escalates to 911." },
  { id: "router", label: "Cardiovascular triage router", detail: "Eight acute pathways scored and ranked in parallel." },
  { id: "assess", label: "Condition-specific assessment", detail: "Leading pathway supplies the next questions to ask." },
  { id: "dispo", label: "Disposition recommendation", detail: "Emergency · Urgent · Prompt follow-up · Routine scheduling." },
];

const SYMPTOM_LABELS: Record<string, string> = {
  dyspnea: "Shortness of breath",
  dyspnea_at_rest: "Breathless at rest",
  orthopnea: "Breathless lying flat",
  paroxysmal_nocturnal_dyspnea: "Waking breathless at night",
  diaphoresis: "Sweating",
  nausea: "Nausea",
  vomiting: "Vomiting",
  palpitations: "Palpitations",
  irregular_heartbeat: "Irregular heartbeat",
  syncope: "Fainting",
  presyncope: "Near-fainting",
  exertional_syncope: "Fainting on exertion",
  dizziness: "Dizziness",
  leg_swelling: "Leg swelling",
  unilateral_leg_swelling: "One swollen calf",
  hemoptysis: "Coughing blood",
  fever: "Fever",
  recent_viral_illness: "Recent viral illness",
  severe_headache: "Severe headache",
  vision_changes: "Vision changes",
  confusion: "Confusion",
  focal_neuro_deficit: "Focal weakness / speech change",
  fatigue: "Fatigue",
  rapid_weight_gain: "Rapid weight gain",
  cough: "Cough",
};

const HISTORY_LABELS: Record<string, string> = {
  coronary_artery_disease: "Coronary artery disease",
  prior_myocardial_infarction: "Prior heart attack",
  prior_stent_or_bypass: "Stent / bypass",
  heart_failure: "Heart failure",
  arrhythmia: "Arrhythmia",
  atrial_fibrillation: "Atrial fibrillation",
  hypertension: "Hypertension",
  diabetes: "Diabetes",
  hyperlipidemia: "High cholesterol",
  smoking: "Smoking",
  family_history_premature_cad: "Family history of early CAD",
  family_history_sudden_death: "Family history of sudden death",
  prior_pe_or_dvt: "Prior clot (DVT / PE)",
  active_cancer: "Active cancer",
  recent_surgery_or_immobilization: "Recent surgery / immobility",
  pregnancy_or_estrogen_use: "Pregnancy / estrogen",
  connective_tissue_disorder: "Connective tissue disorder",
  known_aortic_aneurysm: "Aortic aneurysm",
  chronic_kidney_disease: "Chronic kidney disease",
  stimulant_or_cocaine_use: "Stimulant use",
  valvular_disease_or_murmur: "Valve disease / murmur",
  hypertrophic_cardiomyopathy: "Hypertrophic cardiomyopathy",
  pacemaker_or_icd: "Pacemaker / ICD",
};

export function symptomLabel(key: string): string {
  return SYMPTOM_LABELS[key] ?? key.replace(/_/g, " ");
}
export function historyLabel(key: string): string {
  return HISTORY_LABELS[key] ?? key.replace(/_/g, " ");
}

/** Split a tri-state record into present / absent / unknown lists. */
export function triState(record: Record<string, boolean | null> | undefined) {
  const present: string[] = [];
  const absent: string[] = [];
  const unknown: string[] = [];
  Object.entries(record ?? {}).forEach(([k, v]) => {
    if (v === true) present.push(k);
    else if (v === false) absent.push(k);
    else unknown.push(k);
  });
  return { present, absent, unknown };
}

export function describeChestPain(cp: ChestPainFindings | undefined): string[] {
  if (!cp || !cp.present) return [];
  const bits: string[] = [];
  if (cp.quality) bits.push(`${cp.quality} quality`);
  if (cp.location) bits.push(`${cp.location} location`);
  if (cp.radiation?.length) bits.push(`radiates to ${cp.radiation.join(", ").replace(/_/g, " ")}`);
  if (cp.exertional) bits.push("brought on by exertion");
  if (cp.relieved_by_rest) bits.push("relieved by rest");
  if (cp.pleuritic) bits.push("worse on breathing");
  if (cp.positional) bits.push("positional");
  if (cp.duration_minutes) bits.push(`lasting ~${cp.duration_minutes} min`);
  if (cp.ongoing) bits.push("ongoing");
  if (cp.severity != null) bits.push(`severity ${cp.severity}/10`);
  return bits;
}
