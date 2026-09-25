// API Response Types

export enum Role {
  Assistant = "assistant",
  User = "user",
}

export interface MessageProps {
  id?: string;
  type: string;
  text: string;
}
export interface UserResponse {
  question_id: number;
  question: string;
  answer: string;
  session_id: string;
}

export interface AssessmentRequest {
  responses: UserResponse[];
  session_id: string;
}

export interface VoiceRequest {
  session_id: string;
  responses: ConversationMessage[];
}

export interface AppointmentRequest {
  patient_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  session_id: string;
  insurance_provider?: string;
  reason_for_visit?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

// Assessment Types
export interface Question {
  id: number;
  question: string;
  type: "text" | "number" | "choice";
  options?: string[];
}

export interface QuestionsResponse {
  questions: Question[];
}

export interface AssessmentResult {
  risk_score: number;
  risk_level: "HIGH" | "MODERATE" | "LOW_MODERATE" | "LOW";
  recommendation:
    | "EMERGENCY_ROOM"
    | "URGENT_CARDIOLOGY"
    | "CARDIOLOGY_APPOINTMENT"
    | "MONITOR";
  message: string;
  risk_factors: string[];
}

// Voice Types
export interface ConversationMessage {
  role: Role;
  content: string;
  timestamp: string;
}

export interface TranscriptionResponse {
  transcription: string;
}

export interface SpeechResponse {
  audio_url: string;
}

// Appointment Types
export interface AppointmentResponse {
  success: boolean;
  appointment_id: string;
  message: string;
}

export interface SessionData {
  responses: UserResponse[];
  assessment?: AssessmentResult;
  timestamp: string;
  appointment?: AppointmentData;
}

export interface AppointmentData {
  appointment_id: string;
  patient_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
  insurance_provider?: string;
  reason_for_visit?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

// Component Props Types
export interface TextModeProps {
  sessionId: string;
  onComplete: (result: AssessmentResult) => void;
}

export interface VoiceModeProps {
  sessionId: string;
  onComplete: (result: AssessmentResult) => void;
}

export interface ResultsProps {
  result: AssessmentResult;
  onScheduleAppointment: () => void;
  onNewAssessment: () => void;
}

export interface AppointmentSchedulerProps {
  sessionId: string;
  onBack: () => void;
  onComplete: () => void;
}

// Form Data Types
export interface AppointmentFormData {
  patient_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  insurance_provider: string;
  reason_for_visit: string;
  emergency_contact: string;
  emergency_phone: string;
}

// API Error Types
export interface APIError {
  detail: string;
  status_code?: number;
}

// MediaRecorder Types (for better browser compatibility)
export interface MediaRecorderEventMap {
  dataavailable: BlobEvent;
  error: Event;
  pause: Event;
  resume: Event;
  start: Event;
  stop: Event;
}

export interface CustomMediaRecorder extends EventTarget {
  readonly mimeType: string;
  readonly state: "inactive" | "recording" | "paused";
  readonly stream: MediaStream;
  ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => void) | null;
  onerror: ((this: MediaRecorder, ev: Event) => void) | null;
  onpause: ((this: MediaRecorder, ev: Event) => void) | null;
  onresume: ((this: MediaRecorder, ev: Event) => void) | null;
  onstart: ((this: MediaRecorder, ev: Event) => void) | null;
  onstop: ((this: MediaRecorder, ev: Event) => void) | null;
  pause(): void;
  requestData(): void;
  resume(): void;
  start(timeslice?: number): void;
  stop(): void;
}

// Screen Types
export type ScreenType = "assessment" | "results" | "appointment";
export type ModeType = "text" | "voice";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  session_id?: string;
  messages: Message[];
}

// types/index.ts
export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "number" | "text" | "multiple_choice";
  scoring: Record<string, number>;
}

export interface AssessmentResponse {
  [key: string]: string;
}

/** A triaged patient as returned by `GET /api/patients` on the backend. */
export interface PatientRecord {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone_number: string;
  pain_quality: string;
  location: string;
  stress: string;
  sob: string;
  hypertension: string;
  diabetes: string;
  hyperlipidemia: string;
  smoking: string;
  /** Model probability of a cardiac cause. May be 0–1 or 0–100. */
  probability: number;
}
