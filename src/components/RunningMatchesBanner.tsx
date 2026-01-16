import { Link } from 'react-router-dom';
import { Video, Zap, Circle } from 'lucide-react';
import { useRunningMatches } from '@/hooks/useSportsData';

export function RunningMatchesBanner() {
  const { data: runningMatches, isLoading } = useRunningMatches();

  if (isLoading || !runningMatches || runningMatches.length === 0) {
    return null;
  }

  const hasMultipleMatches = runningMatches.length > 1;

  // Duplicate matches for seamless infinite scroll effect
  const displayMatches = hasMultipleMatches 
    ? [...runningMatches, ...runningMatches] 
    : runningMatches;

  return (
    <div className="bg-destructive text-destructive-foreground py-2 overflow-hidden">
      <div className="flex items-center">
        {/* Fixed "LIVE NOW" label */}
        <div className="flex items-center gap-2 px-4 flex-shrink-0 bg-destructive z-10 pr-4 border-r border-destructive-foreground/20">
          <div className="relative">
            <Circle className="w-3 h-3 fill-current" />
            <Circle className="w-3 h-3 fill-current absolute inset-0 animate-ping opacity-75" />
          </div>
          <span className="font-bold text-sm uppercase tracking-wide">LIVE NOW</span>
        </div>
        
        {/* Scrolling ticker for multiple matches */}
        <div className="flex-1 overflow-hidden relative group">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-destructive to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-destructive to-transparent z-10 pointer-events-none" />
          
          <div 
            className={`flex ${hasMultipleMatches ? 'animate-marquee group-hover:[animation-play-state:paused]' : 'justify-center'}`}
            style={hasMultipleMatches ? { width: 'max-content' } : undefined}
          >
            {displayMatches.map((match: any, idx: number) => (
              <Link
                key={`${match.id}-${idx}`}
                to={`/team-sports/${match.sport_id}`}
                className="flex items-center gap-3 px-6 whitespace-nowrap hover:bg-destructive-foreground/20 active:bg-destructive-foreground/30 transition-colors py-1.5 rounded cursor-pointer"
              >
                <span className="text-lg">{match.sports?.icon}</span>
                <span className="font-semibold underline-offset-2 hover:underline">{match.match_name}</span>
                {match.venue && (
                  <span className="text-destructive-foreground/70 text-sm">• {match.venue}</span>
                )}
                {match.live_stream_url && (
                  <span className="flex items-center gap-1 text-xs bg-destructive-foreground/20 px-2 py-0.5 rounded-full">
                    <Video className="w-3 h-3" />
                    WATCH
                  </span>
                )}
                {hasMultipleMatches && (
                  <span className="text-destructive-foreground/40 mx-4">|</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
