import { createClient } from '@/lib/supabase/client';
import { Application, Step, StepLink, StepFile, Category, Status } from '@/lib/types';
import { calculatePriority, calculateProgress } from '@/lib/priority';
import { getTemplateById } from '@/lib/templates';

const supabase = createClient();

// Type for database application
interface DbApplication {
  id: string;
  user_id: string;
  title: string;
  category: Category;
  deadline: string;
  status: Status;
  priority: number;
  notes: string | null;
  reminders_enabled: boolean;
  custom_reminder_date: string | null;
  created_at: string;
  updated_at: string;
}

// Type for database step
interface DbStep {
  id: string;
  application_id: string;
  user_id: string;
  title: string;
  position: number;
  completed: boolean;
  estimated_minutes: number | null;
  note: string | null;
  blocked_by: string | null;
  blocked_until: string | null;
  completed_at: string | null;
  created_at: string;
}

// Type for database step link
interface DbStepLink {
  id: string;
  step_id: string;
  user_id: string;
  url: string;
  label: string;
  created_at: string;
}

// Type for database step file
interface DbStepFile {
  id: string;
  step_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

// Convert DB application to app type
function toApplication(db: DbApplication): Application {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    category: db.category,
    deadline: db.deadline,
    status: db.status,
    priority: db.priority,
    notes: db.notes || undefined,
    remindersEnabled: db.reminders_enabled,
    customReminderDate: db.custom_reminder_date || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Convert DB step to app type
function toStep(db: DbStep, links?: StepLink[], files?: StepFile[]): Step {
  return {
    id: db.id,
    applicationId: db.application_id,
    title: db.title,
    position: db.position,
    completed: db.completed,
    estimatedMinutes: db.estimated_minutes || undefined,
    note: db.note || undefined,
    blockedBy: db.blocked_by || undefined,
    blockedUntil: db.blocked_until || undefined,
    completedAt: db.completed_at || undefined,
    links: links || [],
    files: files || [],
    createdAt: db.created_at,
  };
}

// ============ Applications ============

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('priority', { ascending: false });

  if (error) throw error;
  return (data || []).map(toApplication);
}

export async function createApplication(
  title: string,
  category: Category,
  deadline: string,
  templateId?: string
): Promise<{ applicationId: string; steps: Step[] }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create application
  const { data: app, error: appError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      title,
      category,
      deadline,
      status: 'DRAFT',
      priority: 0,
    })
    .select()
    .single();

  if (appError) throw appError;

  // Create steps from template if provided
  let newSteps: Step[] = [];
  if (templateId) {
    const template = getTemplateById(templateId);
    if (template) {
      const stepsToInsert = template.steps.map((step, index) => ({
        application_id: app.id,
        user_id: user.id,
        title: step.title,
        position: index + 1,
        completed: false,
        estimated_minutes: step.estimatedMinutes,
      }));

      const { data: steps, error: stepsError } = await supabase
        .from('steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) throw stepsError;
      newSteps = (steps || []).map(s => toStep(s));
    }
  }

  // Calculate and update priority
  const progress = calculateProgress(newSteps);
  const priority = calculatePriority(deadline, progress);
  
  await supabase
    .from('applications')
    .update({ priority })
    .eq('id', app.id);

  return { applicationId: app.id, steps: newSteps };
}

export async function updateApplication(
  id: string,
  updates: Partial<Application>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.remindersEnabled !== undefined) dbUpdates.reminders_enabled = updates.remindersEnabled;
  if (updates.customReminderDate !== undefined) dbUpdates.custom_reminder_date = updates.customReminderDate === null ? null : updates.customReminderDate;

  const { error } = await supabase
    .from('applications')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ Steps ============

export async function fetchSteps(applicationId: string): Promise<Step[]> {
  const { data: steps, error: stepsError } = await supabase
    .from('steps')
    .select('*')
    .eq('application_id', applicationId)
    .order('position');

  if (stepsError) throw stepsError;

  // Fetch links and files for all steps
  const stepIds = (steps || []).map(s => s.id);
  
  const { data: links } = await supabase
    .from('step_links')
    .select('*')
    .in('step_id', stepIds);

  const { data: files } = await supabase
    .from('step_files')
    .select('*')
    .in('step_id', stepIds);

  return (steps || []).map(step => {
    const stepLinks: StepLink[] = (links || [])
      .filter(l => l.step_id === step.id)
      .map(l => ({
        id: l.id,
        url: l.url,
        label: l.label,
        createdAt: l.created_at,
      }));

    const stepFiles: StepFile[] = (files || [])
      .filter(f => f.step_id === step.id)
      .map(f => ({
        id: f.id,
        fileName: f.file_name,
        fileType: f.file_type,
        fileSize: f.file_size,
        dataUrl: '', // Will be fetched from storage when needed
        uploadedAt: f.created_at,
      }));

    return toStep(step, stepLinks, stepFiles);
  });
}

export async function createStep(
  applicationId: string,
  title: string,
  estimatedMinutes?: number
): Promise<Step> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get max position
  const { data: existingSteps } = await supabase
    .from('steps')
    .select('position')
    .eq('application_id', applicationId)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = existingSteps?.[0]?.position || 0;

  const { data, error } = await supabase
    .from('steps')
    .insert({
      application_id: applicationId,
      user_id: user.id,
      title,
      position: maxPosition + 1,
      completed: false,
      estimated_minutes: estimatedMinutes,
    })
    .select()
    .single();

  if (error) throw error;
  return toStep(data);
}

export async function updateStep(
  stepId: string,
  updates: Partial<Step>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.position !== undefined) dbUpdates.position = updates.position;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
  if (updates.note !== undefined) dbUpdates.note = updates.note;
  if (updates.blockedBy !== undefined) dbUpdates.blocked_by = updates.blockedBy;
  if (updates.blockedUntil !== undefined) dbUpdates.blocked_until = updates.blockedUntil;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

  const { error } = await supabase
    .from('steps')
    .update(dbUpdates)
    .eq('id', stepId);

  if (error) throw error;
}

export async function deleteStep(stepId: string): Promise<void> {
  const { error } = await supabase
    .from('steps')
    .delete()
    .eq('id', stepId);

  if (error) throw error;
}

// ============ Step Links ============

export async function createStepLink(
  stepId: string,
  url: string,
  label: string
): Promise<StepLink> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('step_links')
    .insert({
      step_id: stepId,
      user_id: user.id,
      url,
      label,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    url: data.url,
    label: data.label,
    createdAt: data.created_at,
  };
}

export async function deleteStepLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('step_links')
    .delete()
    .eq('id', linkId);

  if (error) throw error;
}

// ============ Step Files ============

export async function uploadStepFile(
  stepId: string,
  file: File
): Promise<StepFile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload to storage
  const storagePath = `${user.id}/${stepId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('step-files')
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  // Create database record
  const { data, error } = await supabase
    .from('step_files')
    .insert({
      step_id: stepId,
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) throw error;

  // Get download URL
  const { data: urlData } = supabase.storage
    .from('step-files')
    .getPublicUrl(storagePath);

  return {
    id: data.id,
    fileName: data.file_name,
    fileType: data.file_type,
    fileSize: data.file_size,
    dataUrl: urlData.publicUrl,
    uploadedAt: data.created_at,
  };
}

export async function deleteStepFile(
  fileId: string,
  storagePath: string
): Promise<void> {
  // Delete from storage
  await supabase.storage
    .from('step-files')
    .remove([storagePath]);

  // Delete from database
  const { error } = await supabase
    .from('step_files')
    .delete()
    .eq('id', fileId);

  if (error) throw error;
}

// ============ Auth Helpers ============

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
