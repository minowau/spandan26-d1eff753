import { useSportsByCategory, useGroups, useTeams, type Sport } from '@/hooks/useSportsData';
import { SportCard } from '@/components/SportCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

export default function TeamSports() {
  const { data: sports, isLoading } = useSportsByCategory('team');

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            With Points Table & Live Stream
          </div>
          <h1 className="section-title">TEAM SPORTS</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Compete as a team, win as a team. Each sport features group-wise points tables and live streaming.
          </p>
        </div>

        {/* Sports Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sports?.map((sport) => (
              <SportCard key={sport.id} sport={sport} basePath="/team-sports" />
            ))}
          </div>
        )}

        {/* Points Tables Section */}
        {!isLoading && sports && sports.length > 0 && (
          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2 px-2 sm:px-4 lg:px-8">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">POINTS TABLES</h2>
            </div>
            
            <div className="space-y-4">
              {sports.map((sport) => (
                <SportPointsTable key={sport.id} sport={sport} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SportPointsTable({ sport }: { sport: Sport }) {
  const { data: groups, isLoading } = useGroups(sport.id);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-3 sm:p-4 mx-2 sm:mx-4 lg:mx-8">
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mx-2 sm:mx-4 lg:mx-8">
      {/* Sport Header */}
      <div className="bg-primary px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
        <span className="text-xl sm:text-2xl">{sport.icon}</span>
        <h3 className="text-sm sm:text-base font-bold text-primary-foreground">{sport.name}</h3>
      </div>

      {/* Groups */}
      <div className="p-3 sm:p-4 space-y-4">
        {(!groups || groups.length === 0) ? (
          <div className="text-muted-foreground text-xs sm:text-sm p-3 bg-secondary/30 rounded-lg text-center">
            No groups added yet. Add groups from the Admin panel.
          </div>
        ) : (
          groups.map((group) => (
            <GroupTable key={group.id} groupId={group.id} groupName={group.name} sport={sport} />
          ))
        )}
      </div>
    </div>
  );
}

function GroupTable({ groupId, groupName, sport }: { groupId: string; groupName: string; sport: Sport }) {
  const { data: teams, isLoading } = useTeams(groupId);

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-lg" />;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-muted-foreground text-xs sm:text-sm p-3 bg-secondary/30 rounded-lg">
        No teams added yet for {groupName}
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Group Name */}
      <div className="bg-secondary px-3 py-1.5">
        <h4 className="font-semibold text-secondary-foreground text-xs sm:text-sm">{groupName}</h4>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="text-xs sm:text-sm">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold min-w-[100px] py-2 px-2 sm:px-3">Team</TableHead>
              <TableHead className="text-center font-semibold w-8 sm:w-10 py-2 px-1">P</TableHead>
              <TableHead className="text-center font-semibold w-8 sm:w-10 py-2 px-1">W</TableHead>
              <TableHead className="text-center font-semibold w-8 sm:w-10 py-2 px-1">D</TableHead>
              <TableHead className="text-center font-semibold w-8 sm:w-10 py-2 px-1">L</TableHead>
              <TableHead className="text-center font-semibold w-10 sm:w-12 py-2 px-1">Pts</TableHead>
              {sport.uses_nrr && <TableHead className="text-center font-semibold w-12 sm:w-14 py-2 px-1">NRR</TableHead>}
              {sport.uses_gd && <TableHead className="text-center font-semibold w-10 sm:w-12 py-2 px-1">GD</TableHead>}
              {sport.uses_pd && <TableHead className="text-center font-semibold w-10 sm:w-12 py-2 px-1">PD</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team, index) => (
              <TableRow
                key={team.id}
                className={index === 0 ? 'bg-sport-green/10' : ''}
              >
                <TableCell className="font-medium py-1.5 sm:py-2 px-2 sm:px-3">
                  <div className="flex items-center gap-1.5">
                    {index === 0 && (
                      <span className="w-4 h-4 rounded-full bg-sport-green text-sport-green-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                        1
                      </span>
                    )}
                    <span className="truncate">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center py-1.5 sm:py-2 px-1">{team.matches_played}</TableCell>
                <TableCell className="text-center text-sport-green font-semibold py-1.5 sm:py-2 px-1">{team.wins}</TableCell>
                <TableCell className="text-center text-muted-foreground py-1.5 sm:py-2 px-1">{team.draws}</TableCell>
                <TableCell className="text-center text-destructive font-semibold py-1.5 sm:py-2 px-1">{team.losses}</TableCell>
                <TableCell className="text-center font-bold text-primary py-1.5 sm:py-2 px-1">{team.points}</TableCell>
                {sport.uses_nrr && (
                  <TableCell className="text-center py-1.5 sm:py-2 px-1">{team.net_run_rate?.toFixed(3)}</TableCell>
                )}
                {sport.uses_gd && (
                  <TableCell className="text-center py-1.5 sm:py-2 px-1">
                    {(team.goal_difference ?? 0) > 0 ? `+${team.goal_difference}` : team.goal_difference}
                  </TableCell>
                )}
                {sport.uses_pd && (
                  <TableCell className="text-center py-1.5 sm:py-2 px-1">
                    {(team.point_difference ?? 0) > 0 ? `+${team.point_difference}` : team.point_difference}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
