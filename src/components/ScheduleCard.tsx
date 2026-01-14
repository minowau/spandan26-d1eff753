import { Clock, MapPin, Video } from 'lucide-react';
import { MatchStatusBadge, MatchTypeBadge } from './MatchStatusBadge';
import { cn } from '@/lib/utils';

interface ScheduleCardProps {
  match: {
    id: string;
    sport: string;
    sportCategory: 'team' | 'individual' | 'minor';
    matchName: string;
    date: string;
    time: string;
    venue?: string | null;
    teamA?: string | null;
    teamB?: string | null;
    matchType?: 'group' | 'eliminator' | 'semifinal' | 'final';
    groupName?: string | null;
    status?: 'upcoming' | 'running' | 'completed';
    liveStreamUrl?: string | null;
  };
}

export function ScheduleCard({ match }: ScheduleCardProps) {
  const categoryStyles = {
    team: 'border-l-primary',
    individual: 'border-l-sport-green',
    minor: 'border-l-accent',
  };

  const categoryBadgeStyles = {
    team: 'bg-primary/10 text-primary',
    individual: 'bg-sport-green/10 text-sport-green',
    minor: 'bg-accent/10 text-accent',
  };

  const isFinal = match.matchType === 'final';
  const isRunning = match.status === 'running';

  return (
    <div
      className={cn(
        'bg-card rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-all',
        categoryStyles[match.sportCategory],
        isFinal && 'ring-2 ring-accent ring-offset-2',
        isRunning && 'ring-2 ring-destructive ring-offset-2 bg-destructive/5'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn('text-xs font-medium px-2 py-1 rounded-full', categoryBadgeStyles[match.sportCategory])}>
              {match.sport}
            </span>
            {match.matchType && (
              <MatchTypeBadge matchType={match.matchType} groupName={match.groupName} />
            )}
            {match.status && (
              <MatchStatusBadge status={match.status} />
            )}
          </div>
          
          {/* Match name or Team vs Team */}
          <h4 className="font-semibold text-foreground">
            {match.teamA && match.teamB ? (
              <span>
                {match.teamA} <span className="text-muted-foreground">vs</span> {match.teamB}
              </span>
            ) : (
              match.matchName
            )}
          </h4>
          
          {/* Additional match name if teams are specified */}
          {match.teamA && match.teamB && match.matchName && (
            <p className="text-sm text-muted-foreground mt-1">{match.matchName}</p>
          )}

          {/* Live stream indicator */}
          {isRunning && match.liveStreamUrl && (
            <div className="flex items-center gap-1 mt-2 text-destructive text-xs font-medium">
              <Video className="w-3 h-3" />
              Live Stream Available
            </div>
          )}
        </div>
        
        <div className="text-right text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{match.time}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}