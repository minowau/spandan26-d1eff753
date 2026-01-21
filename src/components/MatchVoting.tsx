import { useState, useEffect } from 'react';
import { Vote, Trophy, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MatchVotingProps {
  matchId: string;
  teamA: string;
  teamB: string;
  matchName: string;
  isLive?: boolean;
}

interface VoteData {
  id: string;
  match_id: string;
  team_voted: string;
  user_identifier: string;
}

export function MatchVoting({ matchId, teamA, teamB, matchName, isLive }: MatchVotingProps) {
  const [votes, setVotes] = useState<VoteData[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  // Get or create user identifier
  useEffect(() => {
    let identifier = localStorage.getItem('spandan_user_id');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('spandan_user_id', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

  // Fetch votes
  useEffect(() => {
    const fetchVotes = async () => {
      const { data } = await supabase
        .from('match_votes')
        .select('*')
        .eq('match_id', matchId);
      
      if (data) {
        setVotes(data as VoteData[]);
        const existingVote = data.find(v => v.user_identifier === userIdentifier);
        if (existingVote) {
          setUserVote(existingVote.team_voted);
        }
      }
      setIsLoading(false);
    };

    if (userIdentifier) {
      fetchVotes();
    }

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`votes-${matchId}`)
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
            setVotes(prev => [...prev, payload.new as VoteData]);
          } else if (payload.eventType === 'UPDATE') {
            setVotes(prev => prev.map(v => 
              v.id === (payload.new as VoteData).id ? payload.new as VoteData : v
            ));
          } else if (payload.eventType === 'DELETE') {
            setVotes(prev => prev.filter(v => v.id !== (payload.old as VoteData).id));
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
      const existingVote = votes.find(v => v.user_identifier === userIdentifier);
      
      if (existingVote) {
        if (existingVote.team_voted === team) {
          // Same vote, do nothing
          setIsVoting(false);
          return;
        }
        // Update vote
        await supabase
          .from('match_votes')
          .update({ team_voted: team })
          .eq('id', existingVote.id);
      } else {
        // Insert new vote
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

  const teamAVotes = votes.filter(v => v.team_voted === teamA).length;
  const teamBVotes = votes.filter(v => v.team_voted === teamB).length;
  const totalVotes = teamAVotes + teamBVotes;
  const teamAPercentage = totalVotes > 0 ? Math.round((teamAVotes / totalVotes) * 100) : 50;
  const teamBPercentage = totalVotes > 0 ? Math.round((teamBVotes / totalVotes) * 100) : 50;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-4">
        <div className="text-center text-muted-foreground">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-accent px-4 py-3 flex items-center gap-2">
        <Vote className="w-5 h-5 text-accent-foreground" />
        <h3 className="font-semibold text-accent-foreground">Match Prediction</h3>
        {isLive && (
          <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full animate-pulse">
            🔴 LIVE
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Who do you think will win?
        </p>
        
        {/* Voting buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={userVote === teamA ? 'default' : 'outline'}
            className={`h-auto py-3 flex flex-col gap-1 ${userVote === teamA ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleVote(teamA)}
            disabled={isVoting}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-semibold text-sm">{teamA}</span>
            {userVote === teamA && <span className="text-xs opacity-80">Your pick</span>}
          </Button>
          
          <Button
            variant={userVote === teamB ? 'default' : 'outline'}
            className={`h-auto py-3 flex flex-col gap-1 ${userVote === teamB ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleVote(teamB)}
            disabled={isVoting}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-semibold text-sm">{teamB}</span>
            {userVote === teamB && <span className="text-xs opacity-80">Your pick</span>}
          </Button>
        </div>

        {/* Results */}
        {totalVotes > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{teamA}</span>
              <span className="text-muted-foreground">{teamAPercentage}%</span>
            </div>
            <div className="relative">
              <Progress value={teamAPercentage} className="h-3" />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{teamB}</span>
              <span className="text-muted-foreground">{teamBPercentage}%</span>
            </div>
            <div className="relative">
              <Progress value={teamBPercentage} className="h-3" />
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Users className="w-4 h-4" />
              <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {totalVotes === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Be the first to predict the winner!
          </p>
        )}
      </div>
    </div>
  );
}
