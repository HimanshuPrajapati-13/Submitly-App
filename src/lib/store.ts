'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Application, 
  Step, 
  Document, 
  Category, 
  Status, 
  FilterTab,
  ApplicationWithDetails,
  StepLink,
  StepFile
} from './types';
import { 
  calculatePriority, 
  calculateProgress, 
  getDaysRemaining, 
  getUrgencyLevel, 
  getNextAction 
} from './priority';
import { getTemplateById } from './templates';
import { createClient } from './supabase/client';

interface AppState {
  // Data
  applications: Application[];
  steps: Step[];
  documents: Document[];
  isLoading: boolean;
  isSynced: boolean;
  
  // UI State
  activeFilter: FilterTab;
  searchQuery: string;
  
  // Sync Actions
  loadFromSupabase: () => Promise<void>;
  
  // Application Actions
  addApplication: (
    title: string,
    category: Category,
    deadline: string,
    templateId?: string
  ) => Promise<string>;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => string | null;
  
  // Step Actions
  addStep: (applicationId: string, title: string, estimatedMinutes?: number) => void;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  toggleStepComplete: (stepId: string) => void;
  deleteStep: (stepId: string) => void;
  reorderSteps: (applicationId: string, stepIds: string[]) => void;
  
  // Step Link Actions
  addStepLink: (stepId: string, url: string, label: string) => void;
  deleteStepLink: (stepId: string, linkId: string) => void;
  
  // Step File Actions
  addStepFile: (stepId: string, fileName: string, fileType: string, fileSize: number, dataUrl: string) => void;
  deleteStepFile: (stepId: string, fileId: string) => void;
  
  // Document Actions
  addDocument: (applicationId: string, doc: Omit<Document, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (docId: string) => void;
  
  // UI Actions
  setActiveFilter: (filter: FilterTab) => void;
  setSearchQuery: (query: string) => void;
  
  // Computed (helpers)
  getApplicationWithDetails: (id: string) => ApplicationWithDetails | null;
  getFilteredApplications: () => ApplicationWithDetails[];
  getStepsByApplicationId: (applicationId: string) => Step[];
  getSummaryStats: () => {
    urgentCount: number;
    upcomingCount: number;
    submittedCount: number;
    closedCount: number;
  };
}

const supabase = createClient();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      applications: [],
      steps: [],
      documents: [],
      activeFilter: 'all',
      searchQuery: '',
      isLoading: false,
      isSynced: false,
      
      // Load data from Supabase
      loadFromSupabase: async () => {
        set({ isLoading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          // Fetch applications
          const { data: apps, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .order('priority', { ascending: false });
          
          if (appsError) throw appsError;
          
          // Fetch all steps
          const { data: stepsData, error: stepsError } = await supabase
            .from('steps')
            .select('*')
            .order('position');
          
          if (stepsError) throw stepsError;
          
          // Fetch step links
          const { data: linksData } = await supabase
            .from('step_links')
            .select('*');
          
          // Fetch step files
          const { data: filesData } = await supabase
            .from('step_files')
            .select('*');
          
          // Convert to app types
          const applications: Application[] = (apps || []).map(app => ({
            id: app.id,
            userId: app.user_id,
            title: app.title,
            category: app.category as Category,
            deadline: app.deadline,
            status: app.status as Status,
            priority: app.priority,
            notes: app.notes || undefined,
            remindersEnabled: app.reminders_enabled,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
          }));
          
          const steps: Step[] = (stepsData || []).map(step => {
            const stepLinks: StepLink[] = (linksData || [])
              .filter(l => l.step_id === step.id)
              .map(l => ({
                id: l.id,
                url: l.url,
                label: l.label,
                createdAt: l.created_at,
              }));
            
            const stepFiles: StepFile[] = (filesData || [])
              .filter(f => f.step_id === step.id)
              .map(f => ({
                id: f.id,
                fileName: f.file_name,
                fileType: f.file_type,
                fileSize: f.file_size,
                dataUrl: '', // Will fetch on demand
                uploadedAt: f.created_at,
              }));
            
            return {
              id: step.id,
              applicationId: step.application_id,
              title: step.title,
              position: step.position,
              completed: step.completed,
              estimatedMinutes: step.estimated_minutes || undefined,
              note: step.note || undefined,
              blockedBy: step.blocked_by || undefined,
              blockedUntil: step.blocked_until || undefined,
              completedAt: step.completed_at || undefined,
              createdAt: step.created_at,
              links: stepLinks,
              files: stepFiles,
            };
          });
          
          set({ applications, steps, isLoading: false, isSynced: true });
        } catch (error) {
          console.error('Failed to load from Supabase:', error);
          set({ isLoading: false });
        }
      },
      
      // Application Actions
      addApplication: async (title, category, deadline, templateId) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'local-user';
        
        const newApp: Application = {
          id,
          userId,
          title,
          category,
          deadline,
          status: 'DRAFT',
          priority: 0,
          remindersEnabled: true,
          createdAt: now,
          updatedAt: now,
        };
        
        // Get template steps if applicable
        const templateSteps: Step[] = [];
        if (templateId) {
          const template = getTemplateById(templateId);
          if (template) {
            template.steps.forEach((step, index) => {
              templateSteps.push({
                id: uuidv4(),
                applicationId: id,
                title: step.title,
                position: index + 1,
                completed: false,
                estimatedMinutes: step.estimatedMinutes,
                createdAt: now,
                links: [],
                files: [],
              });
            });
          }
        }
        
        // Calculate priority
        const progress = calculateProgress(templateSteps);
        newApp.priority = calculatePriority(deadline, progress);
        
        // Update local state immediately
        set(state => ({
          applications: [...state.applications, newApp],
          steps: [...state.steps, ...templateSteps],
        }));
        
        // Sync to Supabase if user is logged in
        if (user) {
          try {
            await supabase.from('applications').insert({
              id: newApp.id,
              user_id: userId,
              title: newApp.title,
              category: newApp.category,
              deadline: newApp.deadline,
              status: newApp.status,
              priority: newApp.priority,
              notes: newApp.notes,
              reminders_enabled: newApp.remindersEnabled,
              created_at: newApp.createdAt,
              updated_at: newApp.updatedAt,
            });
            
            if (templateSteps.length > 0) {
              await supabase.from('steps').insert(
                templateSteps.map(step => ({
                  id: step.id,
                  application_id: step.applicationId,
                  user_id: userId,
                  title: step.title,
                  position: step.position,
                  completed: step.completed,
                  estimated_minutes: step.estimatedMinutes,
                  created_at: step.createdAt,
                }))
              );
            }
          } catch (error) {
            console.error('Failed to sync to Supabase:', error);
          }
        }
        
        return id;
      },
      
      updateApplication: (id, updates) => {
        set(state => {
          const updatedApps = state.applications.map(app => {
            if (app.id !== id) return app;
            
            const updatedApp = {
              ...app,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            
            // Recalculate priority if deadline or status changed
            if (updates.deadline || updates.status) {
              const appSteps = state.steps.filter(s => s.applicationId === id);
              const progress = calculateProgress(appSteps);
              updatedApp.priority = calculatePriority(updatedApp.deadline, progress);
            }
            
            return updatedApp;
          });
          
          return { applications: updatedApps };
        });
        
        // Sync to Supabase
        const app = get().applications.find(a => a.id === id);
        if (app) {
          supabase.from('applications').update({
            ...updates,
            updated_at: new Date().toISOString(),
          }).eq('id', id).then(() => {});
        }
      },
      
      deleteApplication: (id) => {
        set(state => ({
          applications: state.applications.filter(app => app.id !== id),
          steps: state.steps.filter(step => step.applicationId !== id),
          documents: state.documents.filter(doc => doc.applicationId !== id),
        }));
        
        // Sync to Supabase (cascade delete handled by DB)
        supabase.from('applications').delete().eq('id', id).then(() => {});
      },
      
      duplicateApplication: (id) => {
        const state = get();
        const originalApp = state.applications.find(app => app.id === id);
        if (!originalApp) return null;
        
        const newId = uuidv4();
        const now = new Date().toISOString();
        
        const duplicatedApp: Application = {
          ...originalApp,
          id: newId,
          title: `${originalApp.title} (Copy)`,
          status: 'DRAFT',
          createdAt: now,
          updatedAt: now,
        };
        
        const originalSteps = state.steps.filter(s => s.applicationId === id);
        const duplicatedSteps: Step[] = originalSteps.map(step => ({
          ...step,
          id: uuidv4(),
          applicationId: newId,
          completed: false,
          completedAt: undefined,
          createdAt: now,
        }));
        
        set(state => ({
          applications: [...state.applications, duplicatedApp],
          steps: [...state.steps, ...duplicatedSteps],
        }));
        
        // Sync to Supabase
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('applications').insert({
              id: duplicatedApp.id,
              user_id: user.id,
              title: duplicatedApp.title,
              category: duplicatedApp.category,
              deadline: duplicatedApp.deadline,
              status: duplicatedApp.status,
              priority: duplicatedApp.priority,
              notes: duplicatedApp.notes,
              reminders_enabled: duplicatedApp.remindersEnabled,
              created_at: duplicatedApp.createdAt,
              updated_at: duplicatedApp.updatedAt,
            }).then(() => {
              if (duplicatedSteps.length > 0) {
                supabase.from('steps').insert(
                  duplicatedSteps.map(step => ({
                    id: step.id,
                    application_id: step.applicationId,
                    user_id: user.id,
                    title: step.title,
                    position: step.position,
                    completed: step.completed,
                    estimated_minutes: step.estimatedMinutes,
                    created_at: step.createdAt,
                  }))
                );
              }
            });
          }
        });
        
        return newId;
      },
      
      // Step Actions
      addStep: (applicationId, title, estimatedMinutes) => {
        const state = get();
        const existingSteps = state.steps.filter(s => s.applicationId === applicationId);
        const maxPosition = Math.max(0, ...existingSteps.map(s => s.position));
        
        const newStep: Step = {
          id: uuidv4(),
          applicationId,
          title,
          position: maxPosition + 1,
          completed: false,
          estimatedMinutes,
          createdAt: new Date().toISOString(),
          links: [],
          files: [],
        };
        
        set(state => ({
          steps: [...state.steps, newStep],
        }));
        
        // Recalculate app priority
        const { updateApplication } = get();
        const appSteps = [...get().steps.filter(s => s.applicationId === applicationId), newStep];
        const app = get().applications.find(a => a.id === applicationId);
        if (app) {
          const progress = calculateProgress(appSteps);
          const priority = calculatePriority(app.deadline, progress);
          updateApplication(applicationId, { priority });
        }
        
        // Sync to Supabase
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('steps').insert({
              id: newStep.id,
              application_id: newStep.applicationId,
              user_id: user.id,
              title: newStep.title,
              position: newStep.position,
              completed: newStep.completed,
              estimated_minutes: newStep.estimatedMinutes,
              created_at: newStep.createdAt,
            });
          }
        });
      },
      
      updateStep: (stepId, updates) => {
        set(state => ({
          steps: state.steps.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        }));
        
        // Sync to Supabase
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
        if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes;
        if (updates.note !== undefined) dbUpdates.note = updates.note;
        if (updates.blockedBy !== undefined) dbUpdates.blocked_by = updates.blockedBy;
        if (updates.blockedUntil !== undefined) dbUpdates.blocked_until = updates.blockedUntil;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        
        supabase.from('steps').update(dbUpdates).eq('id', stepId).then(() => {});
      },
      
      toggleStepComplete: (stepId) => {
        const step = get().steps.find(s => s.id === stepId);
        if (!step) return;
        
        const now = new Date().toISOString();
        const updates = {
          completed: !step.completed,
          completedAt: !step.completed ? now : undefined,
        };
        
        set(state => ({
          steps: state.steps.map(s =>
            s.id === stepId ? { ...s, ...updates } : s
          ),
        }));
        
        // Recalculate app priority
        const app = get().applications.find(a => a.id === step.applicationId);
        if (app) {
          const appSteps = get().steps.filter(s => s.applicationId === step.applicationId);
          const progress = calculateProgress(appSteps);
          const priority = calculatePriority(app.deadline, progress);
          get().updateApplication(step.applicationId, { priority });
        }
        
        // Sync to Supabase
        supabase.from('steps').update({
          completed: updates.completed,
          completed_at: updates.completedAt,
        }).eq('id', stepId).then(() => {});
      },
      
      deleteStep: (stepId) => {
        const step = get().steps.find(s => s.id === stepId);
        
        set(state => ({
          steps: state.steps.filter(s => s.id !== stepId),
        }));
        
        // Recalculate app priority
        if (step) {
          const app = get().applications.find(a => a.id === step.applicationId);
          if (app) {
            const appSteps = get().steps.filter(s => s.applicationId === step.applicationId);
            const progress = calculateProgress(appSteps);
            const priority = calculatePriority(app.deadline, progress);
            get().updateApplication(step.applicationId, { priority });
          }
        }
        
        // Sync to Supabase
        supabase.from('steps').delete().eq('id', stepId).then(() => {});
      },
      
      reorderSteps: (applicationId, stepIds) => {
        set(state => ({
          steps: state.steps.map(step => {
            if (step.applicationId !== applicationId) return step;
            const newPosition = stepIds.indexOf(step.id) + 1;
            return newPosition > 0 ? { ...step, position: newPosition } : step;
          }),
        }));
        
        // Sync to Supabase
        stepIds.forEach((stepId, index) => {
          supabase.from('steps').update({ position: index + 1 }).eq('id', stepId).then(() => {});
        });
      },
      
      // Step Link Actions
      addStepLink: (stepId, url, label) => {
        const newLink: StepLink = {
          id: uuidv4(),
          url,
          label,
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          steps: state.steps.map(step => 
            step.id === stepId 
              ? { ...step, links: [...(step.links || []), newLink] }
              : step
          ),
        }));
        
        // Sync to Supabase
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('step_links').insert({
              id: newLink.id,
              step_id: stepId,
              user_id: user.id,
              url: newLink.url,
              label: newLink.label,
              created_at: newLink.createdAt,
            });
          }
        });
      },
      
      deleteStepLink: (stepId, linkId) => {
        set(state => ({
          steps: state.steps.map(step => 
            step.id === stepId 
              ? { ...step, links: (step.links || []).filter(l => l.id !== linkId) }
              : step
          ),
        }));
        
        // Sync to Supabase
        supabase.from('step_links').delete().eq('id', linkId).then(() => {});
      },
      
      // Step File Actions
      addStepFile: (stepId, fileName, fileType, fileSize, dataUrl) => {
        const newFile: StepFile = {
          id: uuidv4(),
          fileName,
          fileType,
          fileSize,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
        
        set(state => ({
          steps: state.steps.map(step => 
            step.id === stepId 
              ? { ...step, files: [...(step.files || []), newFile] }
              : step
          ),
        }));
        
        // Note: For full Supabase file storage, you'd upload to Supabase Storage
        // For now, we keep files in localStorage only due to base64 size limits
      },
      
      deleteStepFile: (stepId, fileId) => {
        set(state => ({
          steps: state.steps.map(step => 
            step.id === stepId 
              ? { ...step, files: (step.files || []).filter(f => f.id !== fileId) }
              : step
          ),
        }));
      },
      
      // Document Actions
      addDocument: (applicationId, doc) => {
        const newDoc: Document = {
          ...doc,
          id: uuidv4(),
          uploadedAt: new Date().toISOString(),
        };
        
        set(state => ({
          documents: [...state.documents, newDoc],
        }));
      },
      
      deleteDocument: (docId) => {
        set(state => ({
          documents: state.documents.filter(doc => doc.id !== docId),
        }));
      },
      
      // UI Actions
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Computed Helpers
      getApplicationWithDetails: (id) => {
        const state = get();
        const app = state.applications.find(a => a.id === id);
        if (!app) return null;
        
        const appSteps = state.steps
          .filter(s => s.applicationId === id)
          .sort((a, b) => a.position - b.position);
        const appDocs = state.documents.filter(d => d.applicationId === id);
        
        const progress = calculateProgress(appSteps);
        const daysRemaining = getDaysRemaining(app.deadline);
        const urgencyLevel = getUrgencyLevel(app.deadline);
        const nextAction = getNextAction(appSteps);
        
        return {
          ...app,
          steps: appSteps,
          documents: appDocs,
          progress,
          daysRemaining,
          urgencyLevel,
          nextAction,
        };
      },
      
      getFilteredApplications: () => {
        const state = get();
        const { applications, steps, documents, activeFilter, searchQuery } = state;
        
        let filtered = applications.map(app => {
          const appSteps = steps
            .filter(s => s.applicationId === app.id)
            .sort((a, b) => a.position - b.position);
          const appDocs = documents.filter(d => d.applicationId === app.id);
          
          const progress = calculateProgress(appSteps);
          const daysRemaining = getDaysRemaining(app.deadline);
          const urgencyLevel = getUrgencyLevel(app.deadline);
          const nextAction = getNextAction(appSteps);
          
          return {
            ...app,
            steps: appSteps,
            documents: appDocs,
            progress,
            daysRemaining,
            urgencyLevel,
            nextAction,
          };
        });
        
        // Apply filter
        switch (activeFilter) {
          case 'urgent':
            filtered = filtered.filter(app => 
              app.urgencyLevel === 'red' || app.urgencyLevel === 'overdue' || app.urgencyLevel === 'orange'
            );
            break;
          case 'active':
            filtered = filtered.filter(app => 
              app.status === 'DRAFT' || app.status === 'IN_PROGRESS'
            );
            break;
          case 'submitted':
            filtered = filtered.filter(app => 
              app.status === 'SUBMITTED' || app.status === 'RESULT_PENDING'
            );
            break;
          case 'closed':
            filtered = filtered.filter(app => 
              app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'CLOSED'
            );
            break;
        }
        
        // Apply search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(app =>
            app.title.toLowerCase().includes(query) ||
            app.category.toLowerCase().includes(query)
          );
        }
        
        // Sort by priority (highest first)
        return filtered.sort((a, b) => b.priority - a.priority);
      },
      
      getStepsByApplicationId: (applicationId) => {
        return get().steps
          .filter(s => s.applicationId === applicationId)
          .sort((a, b) => a.position - b.position);
      },
      
      getSummaryStats: () => {
        const apps = get().getFilteredApplications();
        
        return {
          urgentCount: apps.filter(a => a.urgencyLevel === 'red' || a.urgencyLevel === 'overdue' || a.urgencyLevel === 'orange').length,
          upcomingCount: apps.filter(a => 
            a.daysRemaining <= 14 && 
            a.daysRemaining > 3 && 
            a.status !== 'SUBMITTED' && 
            a.status !== 'CLOSED'
          ).length,
          submittedCount: apps.filter(a => a.status === 'SUBMITTED' || a.status === 'RESULT_PENDING').length,
          closedCount: apps.filter(a => 
            a.status === 'ACCEPTED' || a.status === 'REJECTED' || a.status === 'CLOSED'
          ).length,
        };
      },
    }),
    {
      name: 'submitly-storage',
      partialize: (state) => ({
        applications: state.applications,
        steps: state.steps,
        documents: state.documents,
      }),
    }
  )
);
