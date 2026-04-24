'use client';

import { useState, useRef } from 'react';
import { 
  Check, 
  Plus, 
  Clock, 
  Lock, 
  Unlock,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Upload,
  X,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Step } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { formatTimeEstimate } from '@/lib/priority';
import { formatDistanceToNow } from 'date-fns';

interface StepsListProps {
  applicationId: string;
  steps: Step[];
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit for localStorage

export function StepsList({ applicationId, steps }: StepsListProps) {
  const { 
    addStep, 
    updateStep, 
    toggleStepComplete, 
    deleteStep,
    addStepLink,
    deleteStepLink,
    addStepFile,
    deleteStepFile
  } = useAppStore();
  
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepTime, setNewStepTime] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<{ id: string; note: string } | null>(null);
  
  // Link state
  const [addingLinkFor, setAddingLinkFor] = useState<string | null>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  
  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // Edit step state
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepTime, setEditStepTime] = useState('');

  const handleAddStep = () => {
    if (newStepTitle.trim()) {
      addStep(
        applicationId, 
        newStepTitle.trim(), 
        newStepTime ? parseInt(newStepTime) : undefined
      );
      setNewStepTitle('');
      setNewStepTime('');
      setIsAddingStep(false);
    }
  };

  const handleToggleBlock = (step: Step) => {
    if (step.blockedBy) {
      updateStep(step.id, { blockedBy: undefined, blockedUntil: undefined });
    } else {
      const reason = prompt('What is blocking this step?');
      if (reason) {
        updateStep(step.id, { blockedBy: reason });
      }
    }
  };

  const handleSaveEditStep = (stepId: string) => {
    if (editStepTitle.trim()) {
      updateStep(stepId, {
        title: editStepTitle.trim(),
        estimatedMinutes: editStepTime ? parseInt(editStepTime, 10) : undefined,
      });
      setEditingStepId(null);
    }
  };

  const handleSaveNote = (stepId: string, note: string) => {
    updateStep(stepId, { note: note.trim() || undefined });
    setEditingNote(null);
  };

  const handleAddLink = (stepId: string) => {
    if (newLinkUrl.trim()) {
      let url = newLinkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      addStepLink(stepId, url, newLinkLabel.trim() || url);
      setNewLinkUrl('');
      setNewLinkLabel('');
      setAddingLinkFor(null);
    }
  };

  const handleFileChange = async (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('File too large! Maximum size is 2MB for localStorage storage.');
      return;
    }

    if (!file.type.includes('pdf')) {
      alert('Only PDF files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addStepFile(stepId, file.name, file.type, file.size, dataUrl);
      setUploadingFor(null);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span>Steps</span>
        <span className="text-sm font-normal text-slate-500">
          ({steps.filter(s => s.completed).length}/{steps.length} complete)
        </span>
      </h2>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={(e) => uploadingFor && handleFileChange(uploadingFor, e)}
      />

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'group relative rounded-lg border transition-all',
              step.completed
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : step.blockedBy
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-slate-800/50 border-white/5 hover:border-white/10'
            )}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Drag handle (visual only for now) */}
              <div className="mt-1 opacity-0 group-hover:opacity-50 cursor-grab">
                <GripVertical className="h-4 w-4 text-slate-500" />
              </div>

              {/* Checkbox */}
              <button
                onClick={() => toggleStepComplete(step.id)}
                className={cn(
                  'flex-shrink-0 mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all',
                  step.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-500 hover:border-blue-500'
                )}
              >
                {step.completed && <Check className="h-3 w-3 text-white" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingStepId === step.id ? (
                  <div className="mb-3 p-3 bg-slate-800/80 rounded-lg border border-blue-500/30">
                    <div className="flex gap-3 mb-2">
                      <Input
                        value={editStepTitle}
                        onChange={(e) => setEditStepTitle(e.target.value)}
                        placeholder="Step title..."
                        className="flex-1 bg-slate-900 border-white/10 text-white"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditStep(step.id)}
                      />
                      <Input
                        value={editStepTime}
                        onChange={(e) => setEditStepTime(e.target.value)}
                        placeholder="Min"
                        type="number"
                        className="w-20 bg-slate-900 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEditStep(step.id)}
                        disabled={!editStepTitle.trim()}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingStepId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      step.completed ? 'text-slate-400 line-through' : 'text-white'
                    )}>
                      {index + 1}. {step.title}
                    </p>
                    
                    {step.blockedBy && !step.completed && (
                      <p className="text-sm text-amber-400 mt-1 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Blocked: {step.blockedBy}
                        {step.blockedUntil && (
                          <span className="text-xs opacity-70">
                            (until {new Date(step.blockedUntil).toLocaleDateString()})
                          </span>
                        )}
                      </p>
                    )}
                    
                    {step.completedAt && step.completed && (
                      <p className="text-xs text-slate-500 mt-1">
                        Completed {formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}
                      </p>
                    )}
                    
                    {/* Quick preview of links and files */}
                    {expandedStepId !== step.id && (
                      <div className="flex gap-4 mt-1">
                        {step.links && step.links.length > 0 && (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {step.links.length} link{step.links.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {step.files && step.files.length > 0 && (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {step.files.length} file{step.files.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {step.note && expandedStepId !== step.id && (
                      <p className="text-sm text-slate-400 mt-1 truncate max-w-md">
                        Note: {step.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {step.estimatedMinutes && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeEstimate(step.estimatedMinutes)}
                      </span>
                    )}
                    
                    <button
                      onClick={() => setExpandedStepId(
                        expandedStepId === step.id ? null : step.id
                      )}
                      className="text-slate-500 hover:text-white p-1"
                    >
                      {expandedStepId === step.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                )}

                {/* Expanded view */}
                {expandedStepId === step.id && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    {/* Note editor */}
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Note</label>
                      {editingNote?.id === step.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNote.note}
                            onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                            placeholder="Add a note..."
                            className="bg-slate-800 border-white/10 text-white text-sm min-h-20"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNote(step.id, editingNote.note)}
                              className="bg-blue-600 hover:bg-blue-500"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingNote(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNote({ id: step.id, note: step.note || '' })}
                          className="text-sm text-slate-400 hover:text-white text-left"
                        >
                          {step.note || 'Click to add a note...'}
                        </button>
                      )}
                    </div>

                    {/* Links section */}
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Links
                      </label>
                      
                      {/* Existing links */}
                      {step.links && step.links.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {step.links.map((link) => (
                            <div
                              key={link.id}
                              className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg group/link"
                            >
                              <ExternalLink className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 truncate flex-1"
                              >
                                {link.label}
                              </a>
                              <button
                                onClick={() => deleteStepLink(step.id, link.id)}
                                className="opacity-0 group-hover/link:opacity-100 text-red-400 hover:text-red-300 p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add link form */}
                      {addingLinkFor === step.id ? (
                        <div className="space-y-2 p-3 bg-slate-800/50 rounded-lg">
                          <Input
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="bg-slate-900 border-white/10 text-white text-sm"
                            autoFocus
                          />
                          <Input
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            placeholder="Link label (optional)"
                            className="bg-slate-900 border-white/10 text-white text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLink(step.id)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddLink(step.id)}
                              disabled={!newLinkUrl.trim()}
                              className="bg-blue-600 hover:bg-blue-500"
                            >
                              Add Link
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingLinkFor(null);
                                setNewLinkUrl('');
                                setNewLinkLabel('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingLinkFor(step.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add link
                        </button>
                      )}
                    </div>

                    {/* Files section */}
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Files (PDF only, max 2MB)
                      </label>
                      
                      {/* Existing files */}
                      {step.files && step.files.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {step.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg group/file"
                            >
                              <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <a
                                  href={file.dataUrl}
                                  download={file.fileName}
                                  className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                                >
                                  {file.fileName}
                                </a>
                                <span className="text-xs text-slate-500">
                                  {formatFileSize(file.fileSize)}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteStepFile(step.id, file.id)}
                                className="opacity-0 group-hover/file:opacity-100 text-red-400 hover:text-red-300 p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload button */}
                      <button
                        onClick={() => {
                          setUploadingFor(step.id);
                          fileInputRef.current?.click();
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Upload PDF
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleBlock(step)}
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      >
                        {step.blockedBy ? (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Mark Blocked
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingStepId(step.id);
                          setEditStepTitle(step.title);
                          setEditStepTime(step.estimatedMinutes ? String(step.estimatedMinutes) : '');
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Delete this step?')) {
                            deleteStep(step.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step */}
      {isAddingStep ? (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-white/10">
          <div className="flex gap-3">
            <Input
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              placeholder="Step title..."
              className="flex-1 bg-slate-900 border-white/10 text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
            />
            <Input
              value={newStepTime}
              onChange={(e) => setNewStepTime(e.target.value)}
              placeholder="Min"
              type="number"
              className="w-20 bg-slate-900 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleAddStep}
              disabled={!newStepTitle.trim()}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Add Step
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingStep(false);
                setNewStepTitle('');
                setNewStepTime('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setIsAddingStep(true)}
          className="mt-4 text-slate-400 hover:text-white w-full justify-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      )}
    </div>
  );
}
