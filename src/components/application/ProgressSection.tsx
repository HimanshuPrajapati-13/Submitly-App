'use client';

import { Progress } from '@/components/ui/progress';
import { ApplicationWithDetails } from '@/lib/types';
import { formatTimeEstimate } from '@/lib/priority';
import { CheckCircle2, Clock, Pause } from 'lucide-react';

interface ProgressSectionProps {
  application: ApplicationWithDetails;
}

export function ProgressSection({ application }: ProgressSectionProps) {
  const { nextAction, progress, steps } = application;
  const completedSteps = steps.filter(s => s.completed).length;
  
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-6">
      {/* Next Action */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
          Next Action
        </h3>
        
        {nextAction.allComplete ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-semibold">All steps complete. Awaiting result.</span>
          </div>
        ) : nextAction.blocked ? (
          <div className="flex items-center gap-2 text-amber-400">
            <Pause className="h-5 w-5" />
            <span className="text-lg font-semibold">
              Blocked: {nextAction.blockedBy}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white">
            <span className="text-violet-400 text-xl">→</span>
            <span className="text-lg font-semibold">{nextAction.step}</span>
            {nextAction.estimatedMinutes && (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeEstimate(nextAction.estimatedMinutes)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Progress</span>
          <span className="text-sm font-medium text-white">
            {completedSteps} of {steps.length} steps ({progress}%)
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-3 bg-slate-800"
        />
      </div>
    </div>
  );
}
