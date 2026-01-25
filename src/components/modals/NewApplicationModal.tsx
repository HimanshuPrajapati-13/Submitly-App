'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, categoryLabels } from '@/lib/types';
import { TEMPLATES, getTemplatesForCategory } from '@/lib/templates';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CheckCircle2, Calendar, FileText } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface NewApplicationModalProps {
  open: boolean;
  onClose: () => void;
  preselectedTemplateId?: string;
}

type Step = 'details' | 'template';

export function NewApplicationModal({ 
  open, 
  onClose, 
  preselectedTemplateId 
}: NewApplicationModalProps) {
  const router = useRouter();
  const { addApplication } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('JOB');
  const [deadline, setDeadline] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(preselectedTemplateId);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCurrentStep('details');
    setTitle('');
    setCategory('JOB');
    setDeadline(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
    setDeadlineTime('23:59');
    setUseTemplate(true);
    setSelectedTemplateId(preselectedTemplateId);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }
    
    if (!deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(`${deadline}T${deadlineTime}`);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateDetails()) {
      if (useTemplate) {
        setCurrentStep('template');
        // Auto-select template for category if not already selected
        if (!selectedTemplateId) {
          const templates = getTemplatesForCategory(category);
          if (templates.length > 0) {
            setSelectedTemplateId(templates[0].id);
          }
        }
      } else {
        handleCreate();
      }
    }
  };

  const handleCreate = async (templateId?: string) => {
    const deadlineISO = new Date(`${deadline}T${deadlineTime}`).toISOString();
    const newAppId = await addApplication(title, category, deadlineISO, templateId || selectedTemplateId);
    
    handleClose();
    router.push(`/applications/${newAppId}`);
  };

  const categoryTemplates = getTemplatesForCategory(category);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentStep === 'details' ? 'Create New Application' : 'Choose Template'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'details' ? (
          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Google SWE Internship"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
              />
              {errors.title && (
                <p className="text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                    <SelectItem 
                      key={cat} 
                      value={cat}
                      className="text-white focus:bg-white/10 focus:text-white"
                    >
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label className="text-slate-300">Deadline *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-slate-900 border-white/10 text-white pl-10"
                  />
                </div>
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="bg-slate-900 border-white/10 text-white w-32"
                />
              </div>
              {errors.deadline && (
                <p className="text-sm text-red-400">{errors.deadline}</p>
              )}
            </div>

            {/* Template Option */}
            <div className="space-y-3">
              <Label className="text-slate-300">Use a template?</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUseTemplate(true)}
                  className={cn(
                    'flex-1 p-4 rounded-lg border text-left transition-all',
                    useTemplate
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Yes, use template</span>
                  </div>
                  <p className="text-sm opacity-70">Start with pre-filled steps</p>
                </button>
                <button
                  type="button"
                  onClick={() => setUseTemplate(false)}
                  className={cn(
                    'flex-1 p-4 rounded-lg border text-left transition-all',
                    !useTemplate
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-slate-900 text-slate-400 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">No, start empty</span>
                  </div>
                  <p className="text-sm opacity-70">Add steps manually</p>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
              >
                {useTemplate ? 'Next →' : 'Create Application'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-slate-400 text-sm">
              Select a template for: <span className="text-white font-medium">{categoryLabels[category]}</span>
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-all',
                    selectedTemplateId === template.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 bg-slate-900 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{template.name}</span>
                    {selectedTemplateId === template.id && (
                      <CheckCircle2 className="h-5 w-5 text-violet-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{template.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {template.steps.length} steps • {template.estimatedHours}h estimated
                  </p>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('details')} 
                className="text-slate-400 hover:text-white"
              >
                ← Back
              </Button>
              <Button 
                onClick={() => handleCreate(selectedTemplateId)}
                disabled={!selectedTemplateId}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white disabled:opacity-50"
              >
                Create with Template →
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
