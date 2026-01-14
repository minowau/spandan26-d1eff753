import { cn } from '@/lib/utils';

interface MatchStatusBadgeProps {
  status: 'upcoming' | 'running' | 'completed';
  className?: string;
}

export function MatchStatusBadge({ status, className }: MatchStatusBadgeProps) {
  const styles = {
    upcoming: 'bg-muted text-muted-foreground',
    running: 'bg-destructive text-destructive-foreground animate-pulse',
    completed: 'bg-sport-green text-sport-green-foreground',
  };

  const labels = {
    upcoming: 'Upcoming',
    running: '🔴 LIVE',
    completed: '✓ Completed',
  };

  return (
    <span className={cn('text-xs font-bold px-2 py-1 rounded-full', styles[status], className)}>
      {labels[status]}
    </span>
  );
}

interface MatchTypeBadgeProps {
  matchType: 'group' | 'eliminator' | 'semifinal' | 'final';
  groupName?: string | null;
  className?: string;
}

export function MatchTypeBadge({ matchType, groupName, className }: MatchTypeBadgeProps) {
  const styles = {
    group: 'bg-secondary text-secondary-foreground',
    eliminator: 'bg-primary/10 text-primary',
    semifinal: 'bg-accent/20 text-accent',
    final: 'bg-accent text-accent-foreground font-bold',
  };

  const labels = {
    group: groupName || 'Group Stage',
    eliminator: 'Eliminator',
    semifinal: 'Semi Final',
    final: '🏆 FINAL',
  };

  return (
    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', styles[matchType], className)}>
      {labels[matchType]}
    </span>
  );
}