import { differenceInDays, parseISO } from 'date-fns';
import { UrgencyLevel, NextAction, Step } from './types';

/**
 * Calculate priority score for an application
 * Higher number = more urgent
 * Formula: (100 - days_remaining) × (100 - progress_percent)
 */
export function calculatePriority(deadline: string, progress: number): number {
  const daysRemaining = getDaysRemaining(deadline);
  const clampedDays = Math.max(0, Math.min(100, daysRemaining));
  const clampedProgress = Math.max(0, Math.min(100, progress));
  return (100 - clampedDays) * (100 - clampedProgress);
}

/**
 * Get number of days remaining until deadline
 */
export function getDaysRemaining(deadline: string | Date | null | undefined): number {
  if (!deadline) return 999; // No deadline = not urgent
  
  try {
    const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : deadline;
    const now = new Date();
    return differenceInDays(deadlineDate, now);
  } catch {
    return 999; // If parsing fails, treat as not urgent
  }
}

/**
 * Get urgency level based on days remaining
 */
export function getUrgencyLevel(deadline: string | Date | null | undefined): UrgencyLevel {
  const daysRemaining = getDaysRemaining(deadline);
  
  if (daysRemaining >= 999) return 'gray'; // No deadline
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 2) return 'red';
  if (daysRemaining <= 7) return 'orange';
  if (daysRemaining <= 14) return 'yellow';
  if (daysRemaining <= 29) return 'blue';
  return 'gray';
}

/**
 * Get urgency display configuration
 */
export function getUrgencyConfig(urgencyLevel: UrgencyLevel): {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  label: string;
} {
  const configs: Record<UrgencyLevel, ReturnType<typeof getUrgencyConfig>> = {
    gray: {
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      icon: '🟢',
      label: '',
    },
    blue: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      icon: '🔵',
      label: '',
    },
    yellow: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      icon: '🟡',
      label: '',
    },
    orange: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: '🟠',
      label: 'SOON',
    },
    red: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      icon: '🔴',
      label: 'URGENT',
    },
    overdue: {
      color: 'text-red-700',
      bgColor: 'bg-red-700/10',
      borderColor: 'border-red-700/30',
      icon: '🔴',
      label: 'OVERDUE',
    },
  };
  return configs[urgencyLevel];
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(deadline: string | Date | null | undefined): string {
  const days = getDaysRemaining(deadline);
  if (days >= 999) return 'No deadline';
  if (days < 0) return 'OVERDUE';
  return `D-${days}`;
}

/**
 * Calculate progress percentage based on completed steps
 */
export function calculateProgress(steps: Step[]): number {
  if (steps.length === 0) return 0;
  const completed = steps.filter(s => s.completed).length;
  return Math.round((completed / steps.length) * 100);
}

/**
 * Determine next action based on steps
 */
export function getNextAction(steps: Step[]): NextAction {
  const sortedSteps = [...steps].sort((a, b) => a.position - b.position);
  const incompleteSteps = sortedSteps.filter(s => !s.completed);
  
  if (incompleteSteps.length === 0) {
    return {
      allComplete: true,
      blocked: false,
    };
  }
  
  const nextStep = incompleteSteps[0];
  
  if (nextStep.blockedBy) {
    return {
      step: nextStep.title,
      estimatedMinutes: nextStep.estimatedMinutes,
      blocked: true,
      blockedBy: nextStep.blockedBy,
      blockedUntil: nextStep.blockedUntil,
      allComplete: false,
    };
  }
  
  return {
    step: nextStep.title,
    estimatedMinutes: nextStep.estimatedMinutes,
    blocked: false,
    allComplete: false,
  };
}

/**
 * Format time estimate for display
 */
export function formatTimeEstimate(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}
