// Core Types for ATF Apply Too FAST

export type Category = 'JOB' | 'COLLEGE' | 'EXAM' | 'SCHOLARSHIP' | 'OTHER';

export type Status = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'RESULT_PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CLOSED';

export type DocLabel = 'RESUME' | 'SOP' | 'TRANSCRIPT' | 'ID' | 'OTHER';

export type UrgencyLevel = 'gray' | 'blue' | 'yellow' | 'orange' | 'red' | 'overdue';

// Link attached to a step
export interface StepLink {
  id: string;
  url: string;
  label: string;
  createdAt: string;
}

// File attached to a step (stored as base64 for localStorage)
export interface StepFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string; // base64 data URL
  uploadedAt: string;
}

export interface Step {
  id: string;
  applicationId: string;
  title: string;
  position: number;
  completed: boolean;
  estimatedMinutes?: number;
  note?: string;
  blockedBy?: string;
  blockedUntil?: string; // ISO date string
  completedAt?: string; // ISO date string
  links?: StepLink[];
  files?: StepFile[];
  createdAt: string;
}

export interface Document {
  id: string;
  applicationId: string;
  fileName: string;
  fileType: 'PDF' | 'DOC' | 'DOCX';
  fileSize: number;
  label: DocLabel;
  storageUrl: string;
  uploadedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  title: string;
  category: Category;
  deadline: string; // ISO date string
  status: Status;
  priority: number;
  notes?: string;
  remindersEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NextAction {
  step?: string;
  estimatedMinutes?: number;
  blocked: boolean;
  blockedBy?: string;
  blockedUntil?: string;
  allComplete: boolean;
}

export interface ApplicationWithDetails extends Application {
  steps: Step[];
  documents: Document[];
  progress: number;
  daysRemaining: number;
  urgencyLevel: UrgencyLevel;
  nextAction: NextAction;
}

// Template Types
export interface TemplateStep {
  title: string;
  estimatedMinutes?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: Category;
  steps: TemplateStep[];
  estimatedHours: string;
}

// Filter Types
export type FilterTab = 'all' | 'urgent' | 'active' | 'submitted' | 'closed';

// Category display helpers
export const categoryLabels: Record<Category, string> = {
  JOB: 'Job',
  COLLEGE: 'College',
  EXAM: 'Exam',
  SCHOLARSHIP: 'Scholarship',
  OTHER: 'Other',
};

export const statusLabels: Record<Status, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  RESULT_PENDING: 'Result Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
};

export const categoryColors: Record<Category, string> = {
  JOB: 'bg-blue-500',
  COLLEGE: 'bg-purple-500',
  EXAM: 'bg-amber-500',
  SCHOLARSHIP: 'bg-emerald-500',
  OTHER: 'bg-slate-500',
};
