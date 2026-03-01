'use client';

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit2, 
  Copy, 
  Trash2, 
  CheckCircle2,
  Clock,
  MoreHorizontal,
  AlertTriangle,
  Bell,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApplicationWithDetails, Status, statusLabels, categoryLabels, categoryColors } from '@/lib/types';
import { formatDaysRemaining, getUrgencyConfig, getUrgencyLevel } from '@/lib/priority';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ApplicationHeaderProps {
  application: ApplicationWithDetails;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const router = useRouter();
  const { updateApplication, deleteApplication, duplicateApplication } = useAppStore();
  
  const urgencyLevel = getUrgencyLevel(application.deadline);
  const urgencyConfig = getUrgencyConfig(urgencyLevel);
  const daysDisplay = formatDaysRemaining(application.deadline);

  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const handleSendReminder = async () => {
    if (isSendingReminder || reminderSent) return;
    
    setIsSendingReminder(true);
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'workingadi300@gmail.com', 
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
                  ${new Date(application.deadline).toLocaleDateString()} (${daysDisplay})
                </p>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">Sent via Submitly Tracker</p>
            </div>
          `
        }),
      });

      if (response.ok) {
        setReminderSent(true);
        setTimeout(() => setReminderSent(false), 3000);
      } else {
        console.error('Failed to send reminder email');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    updateApplication(application.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplication(application.id);
      router.push('/');
    }
  };

  const handleDuplicate = () => {
    const newId = duplicateApplication(application.id);
    if (newId) {
      router.push(`/applications/${newId}`);
    }
  };

  return (
    <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Top row: Back button and actions */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                <DropdownMenuItem 
                  onClick={handleDuplicate}
                  className="text-slate-200 focus:bg-white/10 cursor-pointer"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and metadata */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              {application.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-white text-xs',
                  categoryColors[application.category]
                )}
              >
                {categoryLabels[application.category]}
              </Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(application.deadline), 'MMMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status selector */}
            <Select value={application.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40 bg-slate-900 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {(Object.keys(statusLabels) as Status[]).map((status) => (
                  <SelectItem 
                    key={status} 
                    value={status}
                    className="text-white focus:bg-white/10 focus:text-white"
                  >
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Send Reminder Button */}
            <Button
              variant="outline"
              size="default"
              disabled={isSendingReminder}
              onClick={handleSendReminder}
              className={cn(
                "rounded-full border-white/10 transition-colors",
                reminderSent 
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300"
                  : "text-slate-300 bg-slate-900/50 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30"
              )}
            >
              {isSendingReminder ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : reminderSent ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2 hidden sm:block" />
              )}
              {isSendingReminder ? 'Sending...' : reminderSent ? 'Reminder Sent' : 'Send Reminder'}
            </Button>

            {/* Deadline badge */}
            <div 
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold',
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
        </div>
      </div>
    </div>
  );
}
