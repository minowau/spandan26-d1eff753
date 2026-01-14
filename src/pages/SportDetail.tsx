import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Video } from 'lucide-react';
import { useSport, useGroups, useTeams, useMatchesBySport, type Sport } from '@/hooks/useSportsData';
import { LiveStream } from '@/components/LiveStream';
import { LiveChat } from '@/components/LiveChat';
import { MatchStatusBadge, MatchTypeBadge } from '@/components/MatchStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function SportDetail() {
  const { sportId } = useParams<{ sportId: string }>();
  const { data: sport, isLoading: sportLoading } = useSport(sportId || '');
  const { data: groups } = useGroups(sportId || '');
  const { data: matches } = useMatchesBySport(sportId || '');

  if (sportLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-16 w-64 mb-10" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!sport) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Sport not found</h1>
          <Link to="/" className="text-accent hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const backPath = {
    team: '/team-sports',
    individual: '/individual-sports',
    minor: '/minor-sports',
  }[sport.category];

  const categoryLabel = {
    team: 'Team Sports',
    individual: 'Individual Sports',
    minor: 'Minor Sports',
  }[sport.category];

  // Find currently running match
  const runningMatch = matches?.find(m => m.status === 'running');
  const currentStreamUrl = runningMatch?.live_stream_url || sport.live_stream_url;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {categoryLabel}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{sport.icon}</span>
            <div>
              <h1 className="section-title">{sport.name.toUpperCase()}</h1>
              <p className="text-muted-foreground">{sport.description}</p>
            </div>
          </div>
          {runningMatch && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-destructive-foreground" />
              LIVE: {runningMatch.match_name}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Stream */}
            {currentStreamUrl && (
              <LiveStream url={currentStreamUrl} title={runningMatch?.match_name || sport.name} />
            )}

            {/* Live Chat (Team Sports Only) */}
            {sport.category === 'team' && (
              <LiveChat sportId={sport.id} sportName={sport.name} />
            )}

            {/* Points Table (Team Sports Only) */}
            {groups && groups.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📊 Points Table
                </h2>
                <div className="space-y-6">
                  {groups.map((group) => (
                    <GroupPointsTable key={group.id} groupId={group.id} groupName={group.name} sport={sport} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Schedule */}
          <div>
            <div className="bg-card rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Match Schedule
              </h3>
              {matches && matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <ScheduleItem key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No matches scheduled yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupPointsTable({ groupId, groupName, sport }: { groupId: string; groupName: string; sport: Sport }) {
  const { data: teams, isLoading } = useTeams(groupId);

  if (isLoading) {
    return <Skeleton className="h-40 rounded-xl" />;
  }

  if (!teams || teams.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="bg-primary px-4 py-3">
        <h4 className="font-semibold text-primary-foreground">{groupName}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="points-table">
          <thead>
            <tr className="bg-secondary">
              <th className="!bg-secondary !text-secondary-foreground">Team</th>
              <th className="!bg-secondary !text-secondary-foreground text-center">P</th>
              <th className="!bg-secondary !text-secondary-foreground text-center">W</th>
              <th className="!bg-secondary !text-secondary-foreground text-center">D</th>
              <th className="!bg-secondary !text-secondary-foreground text-center">L</th>
              <th className="!bg-secondary !text-secondary-foreground text-center">Pts</th>
              {sport.uses_nrr && <th className="!bg-secondary !text-secondary-foreground text-center">NRR</th>}
              {sport.uses_gd && <th className="!bg-secondary !text-secondary-foreground text-center">GD</th>}
              {sport.uses_pd && <th className="!bg-secondary !text-secondary-foreground text-center">PD</th>}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr
                key={team.id}
                className={`${index === 0 ? 'bg-sport-green/10' : 'bg-card'} hover:bg-secondary/50 transition-colors`}
              >
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <span className="w-5 h-5 rounded-full bg-sport-green text-sport-green-foreground flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                    )}
                    {team.name}
                  </div>
                </td>
                <td className="text-center">{team.matches_played}</td>
                <td className="text-center text-sport-green font-semibold">{team.wins}</td>
                <td className="text-center text-muted-foreground">{team.draws}</td>
                <td className="text-center text-destructive font-semibold">{team.losses}</td>
                <td className="text-center font-bold text-primary">{team.points}</td>
                {sport.uses_nrr && <td className="text-center text-sm">{team.net_run_rate?.toFixed(3)}</td>}
                {sport.uses_gd && <td className="text-center text-sm">{team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}</td>}
                {sport.uses_pd && <td className="text-center text-sm">{team.point_difference > 0 ? `+${team.point_difference}` : team.point_difference}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleItem({ match }: { match: any }) {
  const isRunning = match.status === 'running';

  return (
    <div className={`p-3 rounded-lg ${isRunning ? 'bg-destructive/10 ring-1 ring-destructive' : 'bg-secondary/50'}`}>
      <div className="flex items-center gap-2 mb-1">
        <MatchTypeBadge matchType={match.match_type || 'group'} groupName={match.group_name} />
        <MatchStatusBadge status={match.status || 'upcoming'} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-sm">
            {match.team_a && match.team_b ? `${match.team_a} vs ${match.team_b}` : match.match_name}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Jan {match.match_date}, 2026</p>
          <p>{match.match_time}</p>
        </div>
      </div>
      {match.venue && (
        <p className="text-xs text-muted-foreground mt-1">📍 {match.venue}</p>
      )}
      {isRunning && match.live_stream_url && (
        <div className="flex items-center gap-1 mt-2 text-destructive text-xs font-medium">
          <Video className="w-3 h-3" />
          Watch Live
        </div>
      )}
    </div>
  );
}