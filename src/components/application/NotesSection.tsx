'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NotesSectionProps {
  applicationId: string;
  initialNotes?: string;
}

export function NotesSection({ applicationId, initialNotes }: NotesSectionProps) {
  const { updateApplication } = useAppStore();
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save
  useEffect(() => {
    if (notes !== initialNotes) {
      setIsSaving(true);
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        updateApplication(applicationId, { notes });
        setIsSaving(false);
        setLastSaved(new Date());
      }, 1000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, applicationId, updateApplication, initialNotes]);

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>
        <span className={cn(
          'text-xs transition-opacity',
          isSaving ? 'text-amber-400' : 'text-slate-500'
        )}>
          {isSaving 
            ? 'Saving...' 
            : lastSaved 
            ? `Auto-saved ${lastSaved.toLocaleTimeString()}`
            : ''}
        </span>
      </div>
      
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this application... recruiter contacts, tips, referrals, etc."
        className="min-h-32 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 resize-none"
      />
      
      <p className="text-xs text-slate-500 mt-2">
        Notes are automatically saved as you type
      </p>
    </div>
  );
}
