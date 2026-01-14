import { Link } from 'react-router-dom';
import { Video, Zap } from 'lucide-react';
import { useRunningMatches } from '@/hooks/useSportsData';

export function RunningMatchesBanner() {
  const { data: runningMatches, isLoading } = useRunningMatches();

  if (isLoading || !runningMatches || runningMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground py-2 px-4 overflow-hidden">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Zap className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wide">LIVE NOW</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-6 animate-marquee">
            {runningMatches.map((match: any) => (
              <Link
                key={match.id}
                to={`/sport/${match.sport_id}`}
                className="flex items-center gap-2 whitespace-nowrap hover:underline"
              >
                <span>{match.sports?.icon}</span>
                <span className="font-medium">{match.match_name}</span>
                {match.live_stream_url && <Video className="w-3 h-3" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}