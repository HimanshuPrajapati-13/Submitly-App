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
  Loader2,
  Calendar,
  Download
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
  
  const urgencyLevel = getUrgencyLevel(application.deadline, application.status);
  const urgencyConfig = getUrgencyConfig(urgencyLevel);
  const daysDisplay = formatDaysRemaining(application.deadline, application.status);

  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(
    application.deadline ? new Date(application.deadline).toISOString().slice(0, 16) : ''
  );

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

  const handleDeadlineSave = () => {
    if (tempDeadline) {
      updateApplication(application.id, { deadline: new Date(tempDeadline).toISOString() });
    }
    setIsEditingDeadline(false);
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

  const handleScheduleReminder = async (daysFromNow: number) => {
    try {
      setIsSendingReminder(true);
      
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysFromNow);
      // Ensure hour is set nicely for the cron job comparison
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

  const getFormattedGoogleDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');

    // Assume the deadline event ends at the deadline
    const end = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    
    // And starts 1 hour before
    d.setUTCHours(d.getUTCHours() - 1);
    const sYear = d.getUTCFullYear();
    const sMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const sDay = String(d.getUTCDate()).padStart(2, '0');
    const sHours = String(d.getUTCHours()).padStart(2, '0');
    const sMinutes = String(d.getUTCMinutes()).padStart(2, '0');
    const sSeconds = String(d.getUTCSeconds()).padStart(2, '0');
    
    const start = `${sYear}${sMonth}${sDay}T${sHours}${sMinutes}${sSeconds}Z`;
    
    return `${start}/${end}`;
  };

  const handleGoogleCalendar = () => {
    if (!application.deadline) {
        alert("Please set a deadline first!");
        return;
    }
    const dates = getFormattedGoogleDate(application.deadline);
    const title = encodeURIComponent(`Submitly: ${application.title} Deadline`);
    const details = encodeURIComponent(`Status: ${statusLabels[application.status]}\n\nNotes:\n${application.notes || 'No notes provided.'}`);
    
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`, '_blank');
  };

  const handleIcsDownload = () => {
    if (!application.deadline) {
        alert("Please set a deadline first!");
        return;
    }
    const d = new Date(application.deadline);
    
    // Format to YYYYMMDDTHHmmssZ
    const formatDate = (dateObj: Date) => {
      return dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const end = formatDate(d);
    
    const startD = new Date(d);
    startD.setUTCHours(startD.getUTCHours() - 1);
    const start = formatDate(startD);
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:Submitly: ${application.title} Deadline`,
        `DESCRIPTION:Status: ${statusLabels[application.status]}\\nNotes: ${application.notes ? application.notes.replace(/\n/g, '\\n') : ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${application.title.replace(/\s+/g, '_')}_deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
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
              {isEditingDeadline ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="datetime-local" 
                    value={tempDeadline}
                    onChange={(e) => setTempDeadline(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white text-xs rounded-md px-2 py-1 outline-none focus:border-blue-500/50"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleDeadlineSave}
                    className="h-6 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingDeadline(false)}
                    className="h-6 px-2 text-slate-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <span 
                  className="flex items-center gap-1 cursor-pointer hover:text-blue-400 group transition-colors"
                  onClick={() => setIsEditingDeadline(true)}
                  title="Click to edit deadline"
                >
                  <Clock className="h-4 w-4 group-hover:animate-pulse" />
                  {format(new Date(application.deadline), 'MMMM d, yyyy h:mm a')}
                  <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Status selector */}
            <Select value={application.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-900 border-white/10 text-white">
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

            {/* Add to Calendar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="rounded-full border-white/10 text-slate-300 bg-slate-900/50 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-colors h-10 w-10 sm:h-10 sm:w-auto p-0 sm:px-3"
                  title="Add to Calendar"
                >
                  <Calendar className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add to Calendar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 w-48">
                <DropdownMenuItem 
                  onClick={handleGoogleCalendar}
                  className="text-slate-200 focus:bg-white/10 cursor-pointer"
                >
                  <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleIcsDownload}
                  className="text-slate-200 focus:bg-white/10 cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2 text-emerald-400" />
                  Download .ics (Apple/Outlook)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Send/Schedule Reminder Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  disabled={isSendingReminder}
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
                  {isSendingReminder ? 'Sending...' : reminderSent ? 'Reminder Scheduled' : 'Schedule Reminder'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 w-48">
                <DropdownMenuItem 
                  onClick={handleSendReminder}
                  className="text-emerald-400 focus:bg-white/10 focus:text-emerald-400 cursor-pointer"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Now
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => handleScheduleReminder(2)}
                  className="text-slate-200 focus:bg-white/10 cursor-pointer"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  In 2 Days
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleScheduleReminder(4)}
                  className="text-slate-200 focus:bg-white/10 cursor-pointer"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  In 4 Days
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <div className="px-2 py-1.5 flex flex-col gap-2">
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
