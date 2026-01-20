import { useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';
import { useMatchesByDate } from '@/hooks/useSportsData';
import { DateFilter } from '@/components/DateFilter';
import { ScheduleCard } from '@/components/ScheduleCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const festDates = ['22', '23', '24', '25'];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(festDates[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: matches, isLoading } = useMatchesByDate(selectedDate);

  // Filter matches by search query
  const filterBySearch = (match: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.match_name?.toLowerCase().includes(query) ||
      match.team_a?.toLowerCase().includes(query) ||
      match.team_b?.toLowerCase().includes(query) ||
      match.sports?.name?.toLowerCase().includes(query) ||
      match.venue?.toLowerCase().includes(query)
    );
  };

  // Group matches by category and sort by time
  const sortedMatches = matches?.slice()
    .filter(filterBySearch)
    .sort((a: any, b: any) => {
      const timeA = a.match_time.replace(/[^0-9:]/g, '');
      const timeB = b.match_time.replace(/[^0-9:]/g, '');
      return timeA.localeCompare(timeB);
    }) || [];

  const teamMatches = sortedMatches.filter((m: any) => m.sports?.category === 'team');
  const individualMatches = sortedMatches.filter((m: any) => m.sports?.category === 'individual');
  const minorMatches = sortedMatches.filter((m: any) => m.sports?.category === 'minor');

  // Check for any running matches
  const hasRunningMatches = sortedMatches.some((m: any) => m.status === 'running');

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium mb-4">
            <Calendar className="w-4 h-4" />
            January 22-25, 2026
          </div>
          <h1 className="section-title">MATCH SCHEDULE</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Select a date to view all matches scheduled for that day.
          </p>
          {hasRunningMatches && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              Live matches happening now!
            </div>
          )}
        </div>

        {/* Search & Date Filter */}
        <div className="mb-10 space-y-4">
          {/* Search Input */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search matches, teams, sports, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <DateFilter selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        {/* Schedule Content */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : !matches || matches.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No matches scheduled</h3>
            <p className="text-muted-foreground">
              Check back later for updates on this day's matches.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Team Sports */}
            {teamMatches.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  Team Sports
                  <span className="text-sm font-normal text-muted-foreground">
                    ({teamMatches.length} match{teamMatches.length > 1 ? 'es' : ''})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMatches.map((match: any) => (
                    <ScheduleCard
                      key={match.id}
                      match={{
                        id: match.id,
                        sport: match.sports?.name || 'Unknown',
                        sportCategory: match.sports?.category || 'team',
                        matchName: match.match_name,
                        date: match.match_date,
                        time: match.match_time,
                        venue: match.venue,
                        teamA: match.team_a,
                        teamB: match.team_b,
                        matchType: match.match_type || 'group',
                        groupName: match.group_name,
                        status: match.status || 'upcoming',
                        liveStreamUrl: match.live_stream_url,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Sports */}
            {individualMatches.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sport-green" />
                  Individual Sports
                  <span className="text-sm font-normal text-muted-foreground">
                    ({individualMatches.length} match{individualMatches.length > 1 ? 'es' : ''})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {individualMatches.map((match: any) => (
                    <ScheduleCard
                      key={match.id}
                      match={{
                        id: match.id,
                        sport: match.sports?.name || 'Unknown',
                        sportCategory: match.sports?.category || 'individual',
                        matchName: match.match_name,
                        date: match.match_date,
                        time: match.match_time,
                        venue: match.venue,
                        matchType: match.match_type || 'group',
                        status: match.status || 'upcoming',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Minor Sports */}
            {minorMatches.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent" />
                  Minor Sports
                  <span className="text-sm font-normal text-muted-foreground">
                    ({minorMatches.length} match{minorMatches.length > 1 ? 'es' : ''})
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {minorMatches.map((match: any) => (
                    <ScheduleCard
                      key={match.id}
                      match={{
                        id: match.id,
                        sport: match.sports?.name || 'Unknown',
                        sportCategory: match.sports?.category || 'minor',
                        matchName: match.match_name,
                        date: match.match_date,
                        time: match.match_time,
                        venue: match.venue,
                        matchType: match.match_type || 'group',
                        status: match.status || 'upcoming',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}