'use client';

import { Inbox, CheckCircle2, Archive, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterTab } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface EmptyStateProps {
  filter: FilterTab;
  onNewApplication: () => void;
}

export function EmptyState({ filter, onNewApplication }: EmptyStateProps) {
  const { setActiveFilter } = useAppStore();

  const states = {
    all: {
      icon: Inbox,
      title: 'You have no applications yet.',
      description: 'Applications are high-stakes. We help you never miss one.',
      action: 'Add your first application',
      showAction: true,
    },
    urgent: {
      icon: CheckCircle2,
      title: 'Nothing urgent right now!',
      description: 'All your deadlines are under control.',
      action: null,
      showAction: false,
    },
    active: {
      icon: Inbox,
      title: 'No active applications.',
      description: 'Start a new application to track your progress.',
      action: 'Add new application',
      showAction: true,
    },
    submitted: {
      icon: Archive,
      title: 'No submitted applications yet.',
      description: 'Once you submit applications, they will appear here.',
      action: null,
      showAction: false,
    },
    closed: {
      icon: Archive,
      title: 'No closed applications.',
      description: 'Completed applications will appear here.',
      action: null,
      showAction: false,
    },
  };

  const state = states[filter];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800/50 mb-6">
        <Icon className="h-10 w-10 text-slate-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {state.title}
      </h3>
      
      <p className="text-slate-400 max-w-sm mb-6">
        {state.description}
      </p>
      
      {state.showAction && (
        <Button
          onClick={onNewApplication}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white"
        >
          + {state.action}
        </Button>
      )}
      
      {filter !== 'all' && (
        <button
          onClick={() => setActiveFilter('all')}
          className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}
