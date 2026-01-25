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
  AlertTriangle
} from 'lucide-react';
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
