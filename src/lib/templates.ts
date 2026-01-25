import { Template, Category, TemplateStep } from './types';

const jobSteps: TemplateStep[] = [
  { title: 'Tailor resume for this role', estimatedMinutes: 30 },
  { title: 'Write cover letter', estimatedMinutes: 45 },
  { title: 'Complete online application form', estimatedMinutes: 20 },
  { title: 'Upload resume and documents', estimatedMinutes: 10 },
  { title: 'Complete assessments if required', estimatedMinutes: 60 },
  { title: 'Submit application', estimatedMinutes: 5 },
];

const collegeSteps: TemplateStep[] = [
  { title: 'Research program requirements', estimatedMinutes: 30 },
  { title: 'Request official transcripts', estimatedMinutes: 15 },
  { title: 'Prepare statement of purpose', estimatedMinutes: 180 },
  { title: 'Secure recommendation letters - 3 required', estimatedMinutes: 60 },
  { title: 'Complete online application form', estimatedMinutes: 45 },
  { title: 'Upload all required documents', estimatedMinutes: 20 },
  { title: 'Pay application fee', estimatedMinutes: 10 },
  { title: 'Submit application', estimatedMinutes: 5 },
  { title: 'Confirm submission email received', estimatedMinutes: 5 },
];

const scholarshipSteps: TemplateStep[] = [
  { title: 'Verify eligibility criteria', estimatedMinutes: 15 },
  { title: 'Gather financial documents', estimatedMinutes: 30 },
  { title: 'Write required essays', estimatedMinutes: 120 },
  { title: 'Secure recommendation letters', estimatedMinutes: 45 },
  { title: 'Complete application form', estimatedMinutes: 30 },
  { title: 'Upload supporting documents', estimatedMinutes: 15 },
  { title: 'Submit before deadline', estimatedMinutes: 5 },
];

const examSteps: TemplateStep[] = [
  { title: 'Register for exam date', estimatedMinutes: 15 },
  { title: 'Pay registration fee', estimatedMinutes: 10 },
  { title: 'Prepare study plan', estimatedMinutes: 30 },
  { title: 'Complete preparation', estimatedMinutes: undefined }, // Varies
  { title: 'Confirm exam venue and time', estimatedMinutes: 10 },
];

export const TEMPLATES: Template[] = [
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Standard job application process',
    category: 'JOB',
    steps: jobSteps,
    estimatedHours: '3-4',
  },
  {
    id: 'college-application',
    name: 'College Application',
    description: 'University/graduate program application',
    category: 'COLLEGE',
    steps: collegeSteps,
    estimatedHours: '8-10',
  },
  {
    id: 'scholarship-application',
    name: 'Scholarship Application',
    description: 'Scholarship or grant application',
    category: 'SCHOLARSHIP',
    steps: scholarshipSteps,
    estimatedHours: '5-6',
  },
  {
    id: 'exam-registration',
    name: 'Standardized Exam',
    description: 'Standardized test registration and prep',
    category: 'EXAM',
    steps: examSteps,
    estimatedHours: '2 (+ study time)',
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesForCategory(category: Category): Template[] {
  return TEMPLATES.filter(t => t.category === category);
}

export function getDefaultTemplate(category: Category): Template | undefined {
  const categoryTemplates = getTemplatesForCategory(category);
  return categoryTemplates[0];
}
