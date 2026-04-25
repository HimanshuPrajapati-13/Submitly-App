'use client';

import { useRouter } from 'next/navigation';
import { MoreHorizontal, Send, Play, CheckCircle2, Clock } from 'lucide-react';
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
import { useState } from 'react';
import { Loader2, Bell } from 'lucide-react';

interface ApplicationCardProps {
  application: ApplicationWithDetails;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  const { updateApplication, deleteApplication, duplicateApplication } = useAppStore();
  
  const urgencyConfig = getUrgencyConfig(application.urgencyLevel);
  const daysDisplay = formatDaysRemaining(application.deadline, application.status);
  
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

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

  const handleSendReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsSendingReminder(true);
      
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'workingadi300@gmail.com', // Static for now as requested
          subject: `Reminder: ${application.title} Deadline Approaching!`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #60a5fa; margin-bottom: 8px;">Upcoming Deadline Reminder</h2>
              <p style="font-size: 18px; margin-bottom: 24px;">Your application for <strong>${application.title}</strong> requires attention.</p>
              
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">STATUS</p>
                <p style="margin: 0 0 16px 0; font-weight: bold;">${statusLabels[application.status]} (${application.progress}%)</p>
                
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">DEADLINE</p>
                <p style="margin: 0; font-weight: bold; color: ${application.urgencyLevel === 'red' || application.urgencyLevel === 'overdue' ? '#ef4444' : application.urgencyLevel === 'orange' ? '#f59e0b' : '#3b82f6'};">
                  ${application.deadline ? new Date(application.deadline).toLocaleDateString() : 'No deadline'} (${daysDisplay})
                </p>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">Sent via Submitly Tracker</p>
            </div>
          `
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder email');
      }

      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (error) {
      console.error('Failed to send reminder', error);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleScheduleReminder = async (daysFromNow: number) => {
    try {
      setIsSendingReminder(true);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysFromNow);
      targetDate.setHours(8, 0, 0, 0); 
      
      await updateApplication(application.id, {
        customReminderDate: targetDate.toISOString()
      });
      
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (error) {
      console.error('Failed to schedule reminder', error);
      alert('Failed to schedule reminder. Please try again.');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleCustomSchedule = async (dateString: string) => {
     try {
       if (!dateString) return;
       setIsSendingReminder(true);
       
       const targetDate = new Date(dateString);
       targetDate.setHours(8, 0, 0, 0);
       
       await updateApplication(application.id, {
         customReminderDate: targetDate.toISOString()
       });
       
       setReminderSent(true);
       setTimeout(() => setReminderSent(false), 3000);
     } catch(error) {
       console.error('Failed to schedule custom reminder', error);
       alert('Failed to schedule custom reminder. Please try again.');
     } finally {
       setIsSendingReminder(false);
     }
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
      
      <div className="relative p-3">
        {/* Line 1: Title + Deadline */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-white truncate flex-1 tracking-tight">
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
        <div className="mb-2">
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

        {/* Line 3: Progress & Meta (Combined for compactness) */}
        <div className="flex flex-col gap-1.5 mb-2 bg-slate-900/40 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 mr-3">
              <Progress 
                value={application.progress} 
                className="h-1.5 bg-slate-800"
                indicatorClassName={cn(
                  application.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                )}
              />
              <span className="text-xs font-bold text-slate-400 w-8 text-right">
                {application.progress}%
              </span>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                'text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0',
                categoryColors[application.category]
              )}
            >
              {categoryLabels[application.category]}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap',
                application.status === 'SUBMITTED' ? 'bg-emerald-500/20 text-emerald-400' :
                application.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              )}>
                {statusLabels[application.status]}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="whitespace-nowrap">{application.steps.filter(s => s.completed).length}/{application.steps.length} steps</span>
            </div>
            <span className="whitespace-nowrap">Updated {formatDistanceToNow(new Date(application.updatedAt))}</span>
          </div>
        </div>

        {/* Line 4: Quick Actions */}
        <div className="flex flex-wrap items-center gap-1 mt-0 pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full px-2 h-8 text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/applications/${application.id}`);
            }}
          >
            Details
          </Button>
          
          {(application.status === 'DRAFT' || application.status === 'IN_PROGRESS') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full px-2 h-8 text-xs font-medium"
              onClick={handleQuickAction}
            >
              <Send className="h-3 w-3 mr-1" />
              Submit
            </Button>
          )}
          
          {application.status === 'DRAFT' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full px-2 h-8 text-xs font-medium"
              onClick={handleQuickAction}
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}

          {/* Send/Schedule Reminder Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSendingReminder}
                className={cn(
                   "ml-auto rounded-full px-2 h-8 transition-colors text-xs font-medium",
                   reminderSent 
                    ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    : "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                )}
              >
                {isSendingReminder ? (
                  <Loader2 className="h-3 w-3 lg:mr-1 animate-spin" />
                ) : reminderSent ? (
                   <CheckCircle2 className="h-3 w-3 lg:mr-1" />
                ) : (
                  <Bell className="h-3 w-3 lg:mr-1" />
                )}
                <span className="hidden lg:inline">{isSendingReminder ? 'Sending...' : reminderSent ? 'Scheduled' : 'Reminder'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0b1220] border-white/10 backdrop-blur-xl w-48 z-[100]">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleSendReminder(e); }}
                className="text-emerald-400 focus:bg-white/10 focus:text-emerald-400 cursor-pointer"
              >
                <Bell className="h-4 w-4 mr-2" />
                Send Now
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleScheduleReminder(2); }}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <Clock className="h-4 w-4 mr-2" />
                In 2 Days
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleScheduleReminder(4); }}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <Clock className="h-4 w-4 mr-2" />
                In 4 Days
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <div 
                className="px-2 py-1.5 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking inside date picker
              >
                 <span className="text-xs text-slate-400">Custom Date</span>
                 <div className="flex items-center gap-2">
                   <input 
                     type="date"
                     className="bg-slate-800 border-white/10 text-white text-xs rounded px-2 py-1 w-full"
                     onChange={(e) => {
                       if(e.target.value) handleCustomSchedule(e.target.value);
                     }}
                   />
                 </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white rounded-full hover:bg-white/5 ml-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0b1220] border-white/10 backdrop-blur-xl z-[100]">
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
