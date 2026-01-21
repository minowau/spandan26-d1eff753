import { useState, useEffect } from 'react';
import { Trophy, Medal, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSports } from '@/hooks/useSportsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamVoteData {
  team: string;
  votes: number;
}

interface SportLeaderboard {
  sportId: string;
  sportName: string;
  sportIcon: string;
  topTeams: TeamVoteData[];
}

export default function FanLeaderboard() {
  const { data: sports, isLoading: sportsLoading } = useSports();
  const [leaderboards, setLeaderboards] = useState<SportLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teamSports = sports?.filter(s => s.category === 'team') || [];

  useEffect(() => {
    const fetchVotes = async () => {
      if (!teamSports.length) return;

      // Get all matches for team sports
      const { data: matches } = await supabase
        .from('matches')
        .select('id, sport_id, team_a, team_b')
        .in('sport_id', teamSports.map(s => s.id));

      if (!matches || matches.length === 0) {
        setIsLoading(false);
        return;
      }

      // Get all votes
      const matchIds = matches.map(m => m.id);
      const { data: votes } = await supabase
        .from('match_votes')
        .select('*')
        .in('match_id', matchIds);

      if (!votes) {
        setIsLoading(false);
        return;
      }

      // Group matches by sport
      const matchesBySport: Record<string, typeof matches> = {};
      matches.forEach(match => {
        if (!matchesBySport[match.sport_id]) {
          matchesBySport[match.sport_id] = [];
        }
        matchesBySport[match.sport_id].push(match);
      });

      // Calculate team votes per sport
      const sportLeaderboards: SportLeaderboard[] = teamSports.map(sport => {
        const sportMatches = matchesBySport[sport.id] || [];
        const sportMatchIds = sportMatches.map(m => m.id);
        const sportVotes = votes.filter(v => sportMatchIds.includes(v.match_id));

        // Count votes per team
        const teamVotes: Record<string, number> = {};
        sportVotes.forEach(vote => {
          const team = vote.team_voted;
          if (team) {
            teamVotes[team] = (teamVotes[team] || 0) + 1;
          }
        });

        // Convert to array and sort
        const topTeams = Object.entries(teamVotes)
          .map(([team, votes]) => ({ team, votes }))
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 3);

        return {
          sportId: sport.id,
          sportName: sport.name,
          sportIcon: sport.icon,
          topTeams,
        };
      });

      setLeaderboards(sportLeaderboards);
      setIsLoading(false);
    };

    if (teamSports.length > 0) {
      fetchVotes();
    }
  }, [teamSports.length]);

  // Subscribe to realtime vote updates
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-votes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_votes',
        },
        () => {
          // Refetch on any vote change
          if (teamSports.length > 0) {
            setIsLoading(true);
            // Trigger refetch by updating state
            setLeaderboards(prev => [...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamSports.length]);

  if (sportsLoading || isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = leaderboards.reduce(
    (sum, lb) => sum + lb.topTeams.reduce((s, t) => s + t.votes, 0),
    0
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Fan Favorites
          </div>
          <h1 className="section-title">FAN LEADERBOARD</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            See which teams have the most fan support based on match predictions
          </p>
          {totalVotes > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {totalVotes} total predictions made
            </div>
          )}
        </div>

        {/* Leaderboards Grid */}
        {leaderboards.length === 0 || leaderboards.every(lb => lb.topTeams.length === 0) ? (
          <div className="text-center py-16 bg-card rounded-xl">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No predictions yet</h3>
            <p className="text-muted-foreground">
              Be the first to predict match winners and see your favorite team rise to the top!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboards
              .filter(lb => lb.topTeams.length > 0)
              .map((leaderboard) => (
                <Card key={leaderboard.sportId} className="overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{leaderboard.sportIcon}</span>
                      <span>{leaderboard.sportName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {leaderboard.topTeams.map((team, index) => (
                        <div
                          key={team.team}
                          className={`flex items-center gap-4 p-4 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                          }`}
                        >
                          {/* Rank Medal */}
                          <div className="flex-shrink-0">
                            {index === 0 && (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                                <Trophy className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {index === 1 && (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
                                <Medal className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {index === 2 && (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                                <Medal className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Team Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${index === 0 ? 'text-lg' : 'text-base'}`}>
                              {team.team}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {team.votes} vote{team.votes !== 1 ? 's' : ''}
                            </p>
                          </div>

                          {/* Vote count badge */}
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            index === 0 
                              ? 'bg-yellow-500/20 text-yellow-600' 
                              : index === 1 
                                ? 'bg-gray-400/20 text-gray-600' 
                                : 'bg-amber-600/20 text-amber-700'
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Rankings are based on fan predictions for upcoming and live matches.
            <br />
            Vote on your favorite team in any match to support them!
          </p>
        </div>
      </div>
    </div>
  );
}
