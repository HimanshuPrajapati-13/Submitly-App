import { useState, useMemo } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, isToday, isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { getDaysRemaining } from '@/lib/priority';
import { cn } from '@/lib/utils';
import { ApplicationWithDetails } from '@/lib/types';

interface Notification {
  id: string;
  appId: string;
  title: string;
  message: string;
  type: 'custom' | 'deadline';
  urgency: 'high' | 'medium' | 'low';
  date: Date;
}

export function NotificationsDropdown() {
  const router = useRouter();
  const { applications } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const now = new Date();
    
    // We only care about active applications
    const activeApps = applications.filter(
      app => app.status !== 'SUBMITTED' && app.status !== 'RESULT_PENDING'
    );

    for (const app of activeApps) {
      // 1. Check Custom Reminders
      if (app.customReminderDate) {
        const customDate = parseISO(app.customReminderDate);
        // If the custom reminder date is today or in the past
        if (isToday(customDate) || isPast(customDate)) {
          notifs.push({
            id: `custom-${app.id}`,
            appId: app.id,
            title: 'Scheduled Reminder',
            message: `Your custom reminder for ${app.title} is due today.`,
            type: 'custom',
            urgency: 'high',
            date: customDate, // Assuming it fired today
          });
        }
      }

      // 2. Check impending deadlines (7 days or fewer)
      if (app.deadline) {
        const daysRemaining = getDaysRemaining(app.deadline);
        if (daysRemaining >= 0 && daysRemaining <= 7) {
          const deadlineDate = parseISO(app.deadline!);
          let urgency: 'high' | 'medium' | 'low' = 'low';
          if (daysRemaining <= 2) urgency = 'high';
          else if (daysRemaining <= 5) urgency = 'medium';

          notifs.push({
            id: `deadline-${app.id}`,
            appId: app.id,
            title: 'Approaching Deadline',
            message: `${app.title} is due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`,
            type: 'deadline',
            urgency: urgency,
            date: deadlineDate,
          });
        } else if (daysRemaining < 0) {
           // Overdue
           const deadlineDate = parseISO(app.deadline!);
           notifs.push({
            id: `overdue-${app.id}`,
            appId: app.id,
            title: 'OVERDUE Application',
            message: `${app.title} was due ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago!`,
            type: 'deadline',
            urgency: 'high',
            date: deadlineDate,
          });
        }
      }
    }

    // Sort by most critical/recent
    return notifs.sort((a, b) => {
       if (a.urgency === 'high' && b.urgency !== 'high') return -1;
       if (b.urgency === 'high' && a.urgency !== 'high') return 1;
       // then sort by date closest to now
       return a.date.getTime() - b.date.getTime();
    });
  }, [applications]);

  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-1 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 bg-[#0b1220] border-white/10 backdrop-blur-xl p-0 overflow-hidden">
        <div className="bg-slate-900 border-b border-white/5 py-3 px-4 flex justify-between items-center">
          <h3 className="font-semibold text-white">Notifications</h3>
          <span className="text-xs font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            {notifications.length} New
          </span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {!hasNotifications ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
              You're all caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id}
                onClick={() => {
                  router.push(`/applications/${notif.appId}`);
                  setIsOpen(false);
                }}
                className="flex items-start gap-3 p-4 cursor-pointer focus:bg-white/5 border-b border-white/5 last:border-0 rounded-none"
              >
                <div className={cn(
                  "mt-0.5 p-1.5 rounded-full flex-shrink-0",
                  notif.urgency === 'high' ? "bg-red-500/10 text-red-400" :
                  notif.urgency === 'medium' ? "bg-orange-500/10 text-orange-400" :
                  "bg-blue-500/10 text-blue-400"
                )}>
                  {notif.type === 'custom' ? <Clock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-medium text-sm text-slate-200">{notif.title}</div>
                  <div className="text-xs text-slate-400 mt-1 leading-snug">{notif.message}</div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
