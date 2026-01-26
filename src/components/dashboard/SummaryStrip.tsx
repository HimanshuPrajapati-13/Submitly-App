'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SummaryStrip() {
  const { getSummaryStats, setActiveFilter, activeFilter } = useAppStore();
  const stats = getSummaryStats();

  const badges = [
    {
      key: 'urgent' as const,
      count: stats.urgentCount,
      label: 'urgent',
      icon: '🔴',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      key: 'upcoming' as const,
      count: stats.upcomingCount,
      label: 'this week',
      icon: '🟠',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    {
      key: 'submitted' as const,
      count: stats.submittedCount,
      label: 'submitted',
      icon: '🟢',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      key: 'closed' as const,
      count: stats.closedCount,
      label: 'closed',
      icon: '⚫',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
    },
  ];

  const handleClick = (key: string) => {
    if (key === 'upcoming') {
      setActiveFilter('active');
    } else {
      setActiveFilter(key as 'urgent' | 'submitted' | 'closed');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-4">
      {badges.map((badge) => (
        <button
          key={badge.key}
          onClick={() => handleClick(badge.key)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:scale-105',
            badge.bgColor,
            badge.borderColor,
            badge.color,
            activeFilter === badge.key && 'ring-2 ring-blue-500 bg-white/5'
          )}
        >
          <span>{badge.icon}</span>
          <span className="font-bold">{badge.count}</span>
          <span className="opacity-80">{badge.label}</span>
        </button>
      ))}
    </div>
  );
}
