import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Video, Search, X, ChevronDown, ChevronUp, Vote } from 'lucide-react';
import { useSport, useGroups, useTeams, useMatchesBySport, type Sport } from '@/hooks/useSportsData';
import { supabase } from '@/integrations/supabase/client';
import { LiveStream } from '@/components/LiveStream';
import { LiveChat } from '@/components/LiveChat';
import { MatchVoting } from '@/components/MatchVoting';
import { MatchStatusBadge, MatchTypeBadge } from '@/components/MatchStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
export default function SportDetail() {
  const { sportId } = useParams<{ sportId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter matches by search query
  const filteredMatches = matches?.filter(match => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.match_name?.toLowerCase().includes(query) ||
      match.team_a?.toLowerCase().includes(query) ||
      match.team_b?.toLowerCase().includes(query) ||
      match.venue?.toLowerCase().includes(query) ||
      match.group_name?.toLowerCase().includes(query)
    );
  });

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

        {/* Dynamic layout based on content availability */}
        {(() => {
          const hasStream = !!currentStreamUrl;
          const hasChat = sport.category === 'team';
          const hasMainContent = hasStream || hasChat || (groups && groups.length > 0);
          
          // If no main content, center the schedule
          if (!hasMainContent) {
            return (
              <div className="max-w-2xl mx-auto">
                <MatchSchedulePanel 
                  filteredMatches={filteredMatches} 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isCentered={true}
                />
              </div>
            );
          }
          
          return (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Live Stream */}
                {hasStream && (
                  <LiveStream url={currentStreamUrl} title={runningMatch?.match_name || sport.name} />
                )}

                {/* Live Chat (Team Sports Only) */}
                {hasChat && (
                  <LiveChat sportId={sport.id} sportName={sport.name} />
                )}

                {/* Match Voting (for running matches with teams) */}
                {runningMatch && runningMatch.team_a && runningMatch.team_b && (
                  <MatchVoting 
                    matchId={runningMatch.id}
                    teamA={runningMatch.team_a}
                    teamB={runningMatch.team_b}
                    matchName={runningMatch.match_name}
                    isLive={true}
                  />
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
                <MatchSchedulePanel 
                  filteredMatches={filteredMatches} 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isCentered={false}
                />
              </div>
            </div>
          );
        })()}
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

function MatchSchedulePanel({ 
  filteredMatches, 
  searchQuery, 
  setSearchQuery, 
  isCentered 
}: { 
  filteredMatches: any[] | undefined; 
  searchQuery: string; 
  setSearchQuery: (q: string) => void; 
  isCentered: boolean;
}) {
  return (
    <div className={`bg-card rounded-xl p-6 shadow-sm sticky top-24 ${isCentered ? 'w-full' : ''}`}>
      <h3 className={`font-bold mb-4 flex items-center gap-2 ${isCentered ? 'text-xl' : 'text-lg'}`}>
        <Calendar className={`text-accent ${isCentered ? 'w-6 h-6' : 'w-5 h-5'}`} />
        Match Schedule
      </h3>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search matches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {filteredMatches && filteredMatches.length > 0 ? (
        <ScrollArea className={isCentered ? 'h-[500px]' : 'h-[400px]'}>
          <div className="space-y-3 pr-4">
            {filteredMatches.map((match) => (
              <ScheduleItem key={match.id} match={match} isCentered={isCentered} />
            ))}
          </div>
        </ScrollArea>
      ) : searchQuery ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No matches found for "{searchQuery}"
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          No matches scheduled yet.
        </p>
      )}
    </div>
  );
}

function ScheduleItem({ match, isCentered = false }: { match: any; isCentered?: boolean }) {
  const [showVoting, setShowVoting] = useState(false);
  const isRunning = match.status === 'running';
  const isUpcoming = match.status === 'upcoming';
  const hasTeams = match.team_a && match.team_b;
  const canVote = (isUpcoming || isRunning) && hasTeams;

  return (
    <div className={`rounded-lg ${isRunning ? 'bg-destructive/10 ring-1 ring-destructive' : 'bg-secondary/50'} ${isCentered ? 'p-4' : 'p-3'}`}>
      <div className="flex items-center gap-2 mb-1">
        <MatchTypeBadge matchType={match.match_type || 'group'} groupName={match.group_name} />
        <MatchStatusBadge status={match.status || 'upcoming'} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className={`font-medium ${isCentered ? 'text-base' : 'text-sm'}`}>
            {hasTeams ? `${match.team_a} vs ${match.team_b}` : match.match_name}
          </p>
        </div>
        <div className={`text-right text-muted-foreground ${isCentered ? 'text-sm' : 'text-xs'}`}>
          <p>Jan {match.match_date}, 2026</p>
          <p>{match.match_time}</p>
        </div>
      </div>
      {match.venue && (
        <p className={`text-muted-foreground mt-1 ${isCentered ? 'text-sm' : 'text-xs'}`}>📍 {match.venue}</p>
      )}
      {isRunning && match.live_stream_url && (
        <div className={`flex items-center gap-1 mt-2 text-destructive font-medium ${isCentered ? 'text-sm' : 'text-xs'}`}>
          <Video className={isCentered ? 'w-4 h-4' : 'w-3 h-3'} />
          Watch Live
        </div>
      )}
      
      {/* Vote button for upcoming/running matches with teams */}
      {canVote && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-between h-7 text-xs ${showVoting ? 'bg-accent/20' : ''}`}
            onClick={() => setShowVoting(!showVoting)}
          >
            <span className="flex items-center gap-1">
              <Vote className="w-3 h-3" />
              Predict Winner
            </span>
            {showVoting ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          
          {showVoting && (
            <div className="mt-2">
              <InlineMatchVoting
                matchId={match.id}
                teamA={match.team_a}
                teamB={match.team_b}
                isLive={isRunning}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineMatchVoting({ matchId, teamA, teamB, isLive }: { matchId: string; teamA: string; teamB: string; isLive?: boolean }) {
  const [votes, setVotes] = useState<any[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    let identifier = localStorage.getItem('spandan_user_id');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('spandan_user_id', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      const { data } = await supabase
        .from('match_votes')
        .select('*')
        .eq('match_id', matchId);
      
      if (data) {
        setVotes(data);
        const existingVote = data.find((v: any) => v.user_identifier === userIdentifier);
        if (existingVote) {
          setUserVote(existingVote.team_voted);
        }
      }
    };

    if (userIdentifier) {
      fetchVotes();
    }

    const channel = supabase
      .channel(`inline-votes-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_votes',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVotes(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setVotes(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
          } else if (payload.eventType === 'DELETE') {
            setVotes(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, userIdentifier]);

  const handleVote = async (team: string) => {
    if (!userIdentifier || isVoting) return;
    
    setIsVoting(true);
    
    try {
      const existingVote = votes.find((v: any) => v.user_identifier === userIdentifier);
      
      if (existingVote) {
        if (existingVote.team_voted === team) {
          setIsVoting(false);
          return;
        }
        await supabase
          .from('match_votes')
          .update({ team_voted: team })
          .eq('id', existingVote.id);
      } else {
        await supabase.from('match_votes').insert({
          match_id: matchId,
          team_voted: team,
          user_identifier: userIdentifier,
        });
      }
      
      setUserVote(team);
    } catch (error) {
      console.error('Error voting:', error);
    }
    
    setIsVoting(false);
  };

  const teamAVotes = votes.filter((v: any) => v.team_voted === teamA).length;
  const teamBVotes = votes.filter((v: any) => v.team_voted === teamB).length;
  const totalVotes = teamAVotes + teamBVotes;
  const teamAPercentage = totalVotes > 0 ? Math.round((teamAVotes / totalVotes) * 100) : 50;
  const teamBPercentage = totalVotes > 0 ? Math.round((teamBVotes / totalVotes) * 100) : 50;

  return (
    <div className="space-y-2 bg-background/50 rounded-lg p-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={userVote === teamA ? 'default' : 'outline'}
          size="sm"
          className={`h-8 text-xs ${userVote === teamA ? 'ring-1 ring-primary' : ''}`}
          onClick={() => handleVote(teamA)}
          disabled={isVoting}
        >
          {teamA}
          {userVote === teamA && <span className="ml-1">✓</span>}
        </Button>
        
        <Button
          variant={userVote === teamB ? 'default' : 'outline'}
          size="sm"
          className={`h-8 text-xs ${userVote === teamB ? 'ring-1 ring-primary' : ''}`}
          onClick={() => handleVote(teamB)}
          disabled={isVoting}
        >
          {teamB}
          {userVote === teamB && <span className="ml-1">✓</span>}
        </Button>
      </div>

      {totalVotes > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{teamA}: {teamAPercentage}%</span>
            <span>{teamB}: {teamBPercentage}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
            <div 
              className="bg-primary transition-all duration-300" 
              style={{ width: `${teamAPercentage}%` }} 
            />
            <div 
              className="bg-accent transition-all duration-300" 
              style={{ width: `${teamBPercentage}%` }} 
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {totalVotes} prediction{totalVotes !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}