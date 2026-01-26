'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, Send, Play, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ApplicationWithDetails, categoryLabels, categoryColors, statusLabels } from '@/lib/types';
import { formatDaysRemaining, getUrgencyConfig, formatTimeEstimate } from '@/lib/priority';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationCardProps {
  application: ApplicationWithDetails;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  const { updateApplication, deleteApplication, duplicateApplication } = useAppStore();
  
  const urgencyConfig = getUrgencyConfig(application.urgencyLevel);
  const daysDisplay = formatDaysRemaining(application.deadline);

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (application.status === 'DRAFT' || application.status === 'IN_PROGRESS') {
      updateApplication(application.id, { status: 'SUBMITTED' });
    } else if (application.status === 'SUBMITTED') {
      updateApplication(application.id, { status: 'RESULT_PENDING' });
    }
  };

  const handleDelete = (e: Event) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplication(application.id);
    }
  };

  const handleDuplicate = (e: Event) => {
    e.stopPropagation();
    duplicateApplication(application.id);
  };

  return (
    <Card 
      onClick={() => router.push(`/applications/${application.id}`)}
      className={cn(
        'clay-card group relative cursor-pointer overflow-hidden border-0',
        'hover:shadow-xl hover:shadow-blue-500/10',
        urgencyConfig.borderColor
      )}
    >
      {/* Urgency glow effect */}
      <div 
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          application.urgencyLevel === 'red' || application.urgencyLevel === 'overdue' 
            ? 'bg-linear-to-r from-red-500/10 to-transparent'
            : application.urgencyLevel === 'orange'
            ? 'bg-linear-to-r from-amber-500/10 to-transparent'
            : 'bg-linear-to-r from-blue-500/10 to-transparent'
        )}
      />
      
      <div className="relative p-6">
        {/* Line 1: Title + Deadline */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-white truncate flex-1 tracking-tight">
            {application.title}
          </h3>
          <div 
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold shadow-sm',
              urgencyConfig.bgColor,
              urgencyConfig.color
            )}
          >
            <span>{urgencyConfig.icon}</span>
            <span>{daysDisplay}</span>
            {urgencyConfig.label && (
              <span className="text-xs font-medium opacity-80">{urgencyConfig.label}</span>
            )}
          </div>
        </div>

        {/* Line 2: Next Action */}
        <div className="mb-5">
          {application.nextAction.allComplete ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">All steps complete. Awaiting result.</span>
            </div>
          ) : application.nextAction.blocked ? (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-lg">⏸️</span>
              <span className="font-medium">
                Blocked: {application.nextAction.blockedBy}
                {application.nextAction.blockedUntil && (
                  <span className="text-xs ml-1 opacity-70">
                    (until {new Date(application.nextAction.blockedUntil).toLocaleDateString()})
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Next:</span>
              <span className="truncate font-medium">{application.nextAction.step}</span>
              {application.nextAction.estimatedMinutes && (
                <span className="text-xs text-slate-500">
                  ({formatTimeEstimate(application.nextAction.estimatedMinutes)})
                </span>
              )}
              <span className="text-blue-400">→</span>
            </div>
          )}
        </div>

        {/* Line 3: Progress Bar + Category */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Progress 
              value={application.progress} 
              className="h-2 bg-slate-800/50"
              indicatorClassName={cn(
                application.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              )}
            />
          </div>
          <span className="text-sm font-bold text-slate-400">
            {application.progress}%
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              'text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5',
              categoryColors[application.category]
            )}
          >
            {categoryLabels[application.category]}
          </Badge>
        </div>

        {/* Line 4: Metadata */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className={cn(
            'px-2 py-0.5 rounded-md text-xs font-medium',
            application.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400' :
            application.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
            application.status === 'DRAFT' ? 'bg-slate-500/20 text-slate-400' :
            'bg-slate-500/20 text-slate-400'
          )}>
            {statusLabels[application.status]}
          </span>
          <span>•</span>
          <span>
            {application.steps.filter(s => s.completed).length}/{application.steps.length} steps
          </span>
          <span>•</span>
          <span>
            Updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Line 5: Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full px-3"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/applications/${application.id}`);
            }}
          >
            View Details
          </Button>
          
          {(application.status === 'DRAFT' || application.status === 'IN_PROGRESS') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full px-3"
              onClick={handleQuickAction}
            >
              <Send className="h-4 w-4 mr-1" />
              Mark Submitted
            </Button>
          )}
          
          {application.status === 'DRAFT' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full px-3"
              onClick={handleQuickAction}
            >
              <Play className="h-4 w-4 mr-1" />
              Start Working
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white ml-auto rounded-full hover:bg-white/5">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0b1220] border-white/10 backdrop-blur-xl">
              <DropdownMenuItem 
                onClick={(e) => handleDuplicate(e as unknown as Event)}
                className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={(e) => handleDelete(e as unknown as Event)}
                className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-lg my-1"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
