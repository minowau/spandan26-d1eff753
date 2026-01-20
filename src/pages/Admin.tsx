import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Video, Calendar, Trophy, Users, Settings, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
  useSports,
  useAllGroups,
  useAllTeams,
  useAllMatches,
  useSettings,
  useUpdateSport,
  useUpdateTeam,
  useCreateTeam,
  useDeleteTeam,
  useCreateGroup,
  useDeleteGroup,
  useCreateMatch,
  useUpdateMatch,
  useDeleteMatch,
  useUpdateSettings,
  type Sport,
} from '@/hooks/useSportsData';

export default function Admin() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="section-title">ADMIN PANEL</h1>
          <p className="text-muted-foreground mt-2">
            Manage schedules, points tables, live streams, and settings for Spandan'26
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="settings" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Streams</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Trophy className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Points</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Groups</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="schedule">
            <ScheduleTab />
          </TabsContent>
          <TabsContent value="streams">
            <LiveStreamsTab />
          </TabsContent>
          <TabsContent value="points">
            <PointsTableTab />
          </TabsContent>
          <TabsContent value="groups">
            <GroupsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: sports } = useSports();
  const updateSport = useUpdateSport();

  const [festDate, setFestDate] = useState('');

  const handleUpdateFestDate = () => {
    if (!festDate) return;
    updateSettings.mutate(
      { fest_start_date: new Date(festDate).toISOString() },
      {
        onSuccess: () => toast.success('Fest start date updated!'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  const handleUpdateScoringRules = (sport: Sport, field: string, value: number | boolean) => {
    updateSport.mutate(
      { id: sport.id, [field]: value },
      {
        onSuccess: () => toast.success('Scoring rules updated!'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  const teamSports = sports?.filter((s) => s.category === 'team') || [];

  return (
    <div className="space-y-6">
      {/* Countdown Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Countdown Timer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="flex-1 max-w-full sm:max-w-sm">
              <Label className="mb-2 block text-sm">Fest Start Date & Time</Label>
              <Input
                type="datetime-local"
                defaultValue={settings?.fest_start_date ? new Date(settings.fest_start_date).toISOString().slice(0, 16) : '2026-01-22T09:00'}
                onChange={(e) => setFestDate(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateFestDate} disabled={updateSettings.isPending} className="w-full sm:w-auto">
              Save Date
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current: {settings?.fest_start_date ? new Date(settings.fest_start_date).toLocaleString() : 'Not set'}
          </p>
        </CardContent>
      </Card>

      {/* Scoring Rules per Sport */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Rules per Sport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teamSports.map((sport) => (
              <div key={sport.id} className="p-3 sm:p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">{sport.icon}</span>
                  <h4 className="font-semibold text-sm sm:text-base">{sport.name}</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs">Win Pts</Label>
                    <Input
                      type="number"
                      className="mt-1 h-8 sm:h-9 text-sm"
                      defaultValue={sport.win_points || 2}
                      onBlur={(e) => handleUpdateScoringRules(sport, 'win_points', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Draw Pts</Label>
                    <Input
                      type="number"
                      className="mt-1 h-8 sm:h-9 text-sm"
                      defaultValue={sport.draw_points || 1}
                      onBlur={(e) => handleUpdateScoringRules(sport, 'draw_points', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Loss Pts</Label>
                    <Input
                      type="number"
                      className="mt-1 h-8 sm:h-9 text-sm"
                      defaultValue={sport.loss_points || 0}
                      onBlur={(e) => handleUpdateScoringRules(sport, 'loss_points', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs">Tie-breaker</Label>
                    <div className="flex flex-wrap gap-3 sm:gap-2 mt-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={sport.uses_nrr}
                          onChange={(e) => handleUpdateScoringRules(sport, 'uses_nrr', e.target.checked)}
                        />
                        NRR
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={sport.uses_gd}
                          onChange={(e) => handleUpdateScoringRules(sport, 'uses_gd', e.target.checked)}
                        />
                        GD
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={sport.uses_pd}
                          onChange={(e) => handleUpdateScoringRules(sport, 'uses_pd', e.target.checked)}
                        />
                        PD
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiveStreamsTab() {
  const { data: sports, isLoading } = useSports();
  const updateSport = useUpdateSport();

  const handleUpdateStream = (sportId: string, url: string) => {
    updateSport.mutate(
      { id: sportId, live_stream_url: url || null },
      {
        onSuccess: () => toast.success('Stream URL updated!'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  const teamSports = sports?.filter((s) => s.category === 'team') || [];
  const individualSports = sports?.filter((s) => s.category === 'individual') || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Sports - Default Live Stream URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {teamSports.map((sport) => (
            <div key={sport.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{sport.icon}</span>
                <Label className="font-medium text-sm sm:text-base">{sport.name}</Label>
              </div>
              <Input
                className="flex-1 text-sm"
                placeholder="YouTube embed URL"
                defaultValue={sport.live_stream_url || ''}
                onBlur={(e) => handleUpdateStream(sport.id, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Sports - Live Stream URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {individualSports.map((sport) => (
            <div key={sport.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{sport.icon}</span>
                <Label className="font-medium text-sm sm:text-base">{sport.name}</Label>
              </div>
              <Input
                className="flex-1 text-sm"
                placeholder="YouTube embed URL"
                defaultValue={sport.live_stream_url || ''}
                onBlur={(e) => handleUpdateStream(sport.id, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        💡 Tip: Use YouTube embed URLs like: https://www.youtube.com/embed/VIDEO_ID
      </p>
    </div>
  );
}

function ScheduleTab() {
  const { data: matches, isLoading: matchesLoading } = useAllMatches();
  const { data: sports } = useSports();
  const { data: groups } = useAllGroups();
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const [newMatch, setNewMatch] = useState({
    sport_id: '',
    match_name: '',
    match_date: '22',
    match_time: '',
    venue: '',
    team_a: '',
    team_b: '',
    match_type: 'group' as const,
    group_name: '',
    status: 'upcoming' as const,
    live_stream_url: '',
  });

  const handleAddMatch = () => {
    if (!newMatch.sport_id || !newMatch.match_time) {
      toast.error('Please fill sport and time');
      return;
    }
    
    const matchName = newMatch.team_a && newMatch.team_b 
      ? `${newMatch.team_a} vs ${newMatch.team_b}` 
      : newMatch.match_name;
    
    if (!matchName) {
      toast.error('Please enter match name or both teams');
      return;
    }

    createMatch.mutate({
      ...newMatch,
      match_name: matchName,
      team_a: newMatch.team_a || null,
      team_b: newMatch.team_b || null,
      group_name: newMatch.group_name || null,
      venue: newMatch.venue || null,
      live_stream_url: newMatch.live_stream_url || null,
    }, {
      onSuccess: () => {
        toast.success('Match added!');
        setNewMatch({
          sport_id: '',
          match_name: '',
          match_date: '22',
          match_time: '',
          venue: '',
          team_a: '',
          team_b: '',
          match_type: 'group',
          group_name: '',
          status: 'upcoming',
          live_stream_url: '',
        });
      },
      onError: () => toast.error('Failed to add match'),
    });
  };

  const handleToggleStatus = (match: any, newStatus: 'upcoming' | 'running' | 'completed') => {
    updateMatch.mutate(
      { id: match.id, status: newStatus },
      {
        onSuccess: () => toast.success('Match status updated!'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  const handleDeleteMatch = (id: string) => {
    deleteMatch.mutate(id, {
      onSuccess: () => toast.success('Match deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  if (matchesLoading) return <div className="text-center py-8">Loading...</div>;

  const selectedSport = sports?.find(s => s.id === newMatch.sport_id);
  const sportGroups = groups?.filter(g => g.sport_id === newMatch.sport_id) || [];

  return (
    <div className="space-y-6">
      {/* Add New Match */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Select value={newMatch.sport_id} onValueChange={(v) => setNewMatch({ ...newMatch, sport_id: v, group_name: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                {sports?.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.icon} {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={newMatch.match_type} onValueChange={(v: any) => setNewMatch({ ...newMatch, match_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Match Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Group Stage</SelectItem>
                <SelectItem value="eliminator">Eliminator</SelectItem>
                <SelectItem value="semifinal">Semi Final</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newMatch.match_date} onValueChange={(v) => setNewMatch({ ...newMatch, match_date: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22">Jan 22, 2026</SelectItem>
                <SelectItem value="23">Jan 23, 2026</SelectItem>
                <SelectItem value="24">Jan 24, 2026</SelectItem>
                <SelectItem value="25">Jan 25, 2026</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newMatch.match_time} onValueChange={(v) => setNewMatch({ ...newMatch, match_time: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6:00 AM">6:00 AM</SelectItem>
                <SelectItem value="6:30 AM">6:30 AM</SelectItem>
                <SelectItem value="7:00 AM">7:00 AM</SelectItem>
                <SelectItem value="7:30 AM">7:30 AM</SelectItem>
                <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                <SelectItem value="8:30 AM">8:30 AM</SelectItem>
                <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                <SelectItem value="9:30 AM">9:30 AM</SelectItem>
                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                <SelectItem value="12:30 PM">12:30 PM</SelectItem>
                <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                <SelectItem value="1:30 PM">1:30 PM</SelectItem>
                <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                <SelectItem value="2:30 PM">2:30 PM</SelectItem>
                <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                <SelectItem value="3:30 PM">3:30 PM</SelectItem>
                <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                <SelectItem value="4:30 PM">4:30 PM</SelectItem>
                <SelectItem value="5:00 PM">5:00 PM</SelectItem>
                <SelectItem value="5:30 PM">5:30 PM</SelectItem>
                <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                <SelectItem value="6:30 PM">6:30 PM</SelectItem>
                <SelectItem value="7:00 PM">7:00 PM</SelectItem>
                <SelectItem value="7:30 PM">7:30 PM</SelectItem>
                <SelectItem value="8:00 PM">8:00 PM</SelectItem>
                <SelectItem value="8:30 PM">8:30 PM</SelectItem>
                <SelectItem value="9:00 PM">9:00 PM</SelectItem>
                <SelectItem value="9:30 PM">9:30 PM</SelectItem>
                <SelectItem value="10:00 PM">10:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group selection - only show when match_type is 'group' and sport has groups */}
          {newMatch.match_type === 'group' && sportGroups.length > 0 && (
            <div className="mb-4">
              <Select value={newMatch.group_name} onValueChange={(v) => setNewMatch({ ...newMatch, group_name: v })}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select Group (required for group matches)" />
                </SelectTrigger>
                <SelectContent>
                  {sportGroups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Team A"
              value={newMatch.team_a}
              onChange={(e) => setNewMatch({ ...newMatch, team_a: e.target.value })}
            />
            <Input
              placeholder="Team B"
              value={newMatch.team_b}
              onChange={(e) => setNewMatch({ ...newMatch, team_b: e.target.value })}
            />
            <Input
              placeholder="Or Match Name"
              value={newMatch.match_name}
              onChange={(e) => setNewMatch({ ...newMatch, match_name: e.target.value })}
            />
            <Input
              placeholder="Venue (optional)"
              value={newMatch.venue}
              onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder="Live Stream URL (optional)"
              value={newMatch.live_stream_url}
              onChange={(e) => setNewMatch({ ...newMatch, live_stream_url: e.target.value })}
            />
            <Button onClick={handleAddMatch} disabled={createMatch.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Matches */}
      <Card>
        <CardHeader>
          <CardTitle>All Matches ({matches?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
              {matches?.map((match: any) => (
              <div 
                key={match.id} 
                className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg ${
                  match.status === 'running' ? 'bg-destructive/10 ring-1 ring-destructive' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                    {match.sports?.name}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    match.match_type === 'final' ? 'bg-accent text-accent-foreground' : 
                    match.match_type === 'semifinal' ? 'bg-accent/20 text-accent' : 
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {match.match_type === 'group' ? match.group_name || 'Group' : match.match_type}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm sm:text-base block truncate">{match.match_name}</span>
                  <span className="text-xs text-muted-foreground sm:hidden">
                    Jan {match.match_date}, 2026 • {match.match_time}
                  </span>
                </div>
                
                <span className="hidden sm:inline text-sm text-muted-foreground whitespace-nowrap">Jan {match.match_date}, 2026</span>
                <span className="hidden sm:inline text-sm text-muted-foreground">{match.match_time}</span>
                
                {/* Status controls */}
                <div className="flex gap-1 flex-wrap">
                  <Button
                    variant={match.status === 'upcoming' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-xs px-2 h-7 sm:h-8"
                    onClick={() => handleToggleStatus(match, 'upcoming')}
                  >
                    <span className="hidden sm:inline">Upcoming</span>
                    <span className="sm:hidden">Soon</span>
                  </Button>
                  <Button
                    variant={match.status === 'running' ? 'destructive' : 'ghost'}
                    size="sm"
                    className="text-xs px-2 h-7 sm:h-8"
                    onClick={() => handleToggleStatus(match, 'running')}
                  >
                    <Play className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Live</span>
                  </Button>
                  <Button
                    variant={match.status === 'completed' ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs px-2 h-7 sm:h-8"
                    onClick={() => handleToggleStatus(match, 'completed')}
                  >
                    Done
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => handleDeleteMatch(match.id)}
                  disabled={deleteMatch.isPending}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PointsTableTab() {
  const { data: groups } = useAllGroups();
  const { data: teams, isLoading } = useAllTeams();
  const { data: sports } = useSports();
  const updateTeam = useUpdateTeam();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();

  const [newTeam, setNewTeam] = useState({ group_id: '', name: '' });

  const handleUpdateTeam = (team: any, field: string, value: number | string) => {
    updateTeam.mutate(
      { id: team.id, [field]: value },
      {
        onSuccess: () => toast.success('Updated!'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };

  const handleAddTeam = () => {
    if (!newTeam.group_id || !newTeam.name) {
      toast.error('Select a group and enter team name');
      return;
    }
    createTeam.mutate(
      { 
        ...newTeam, 
        matches_played: 0, 
        wins: 0, 
        losses: 0, 
        draws: 0,
        points: 0,
        net_run_rate: 0,
        goal_difference: 0,
        point_difference: 0,
      },
      {
        onSuccess: () => {
          toast.success('Team added!');
          setNewTeam({ group_id: '', name: '' });
        },
        onError: () => toast.error('Failed to add team'),
      }
    );
  };

  const handleDeleteTeam = (id: string) => {
    deleteTeam.mutate(id, {
      onSuccess: () => toast.success('Team deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  // Group teams by group_id
  const teamsByGroup = teams?.reduce((acc: any, team: any) => {
    if (!acc[team.group_id]) acc[team.group_id] = [];
    acc[team.group_id].push(team);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add New Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={newTeam.group_id} onValueChange={(v) => setNewTeam({ ...newTeam, group_id: v })}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                {groups?.map((group: any) => {
                  const sport = sports?.find((s) => s.id === group.sport_id);
                  return (
                    <SelectItem key={group.id} value={group.id}>
                      {sport?.icon} {sport?.name} - {group.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Input
              placeholder="Team Name"
              className="flex-1"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
            <Button onClick={handleAddTeam} disabled={createTeam.isPending} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Points Tables by Group */}
      {groups?.map((group: any) => {
        const sport = sports?.find((s) => s.id === group.sport_id);
        const groupTeams = teamsByGroup?.[group.id] || [];
        
        return (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{sport?.icon}</span>
                {sport?.name} - {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groupTeams.length === 0 ? (
                <p className="text-muted-foreground text-sm">No teams in this group yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Team</th>
                        <th className="text-center py-2 w-16">P</th>
                        <th className="text-center py-2 w-16">W</th>
                        <th className="text-center py-2 w-16">D</th>
                        <th className="text-center py-2 w-16">L</th>
                        <th className="text-center py-2 w-16">Pts</th>
                        {sport?.uses_nrr && <th className="text-center py-2 w-20">NRR</th>}
                        {sport?.uses_gd && <th className="text-center py-2 w-20">GD</th>}
                        {sport?.uses_pd && <th className="text-center py-2 w-20">PD</th>}
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTeams.map((team: any) => (
                        <tr key={team.id} className="border-b">
                          <td className="py-2 font-medium">{team.name}</td>
                          <td className="py-2">
                            <Input
                              type="number"
                              className="w-14 text-center mx-auto"
                              defaultValue={team.matches_played}
                              onBlur={(e) => handleUpdateTeam(team, 'matches_played', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              className="w-14 text-center mx-auto"
                              defaultValue={team.wins}
                              onBlur={(e) => handleUpdateTeam(team, 'wins', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              className="w-14 text-center mx-auto"
                              defaultValue={team.draws}
                              onBlur={(e) => handleUpdateTeam(team, 'draws', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              className="w-14 text-center mx-auto"
                              defaultValue={team.losses}
                              onBlur={(e) => handleUpdateTeam(team, 'losses', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              type="number"
                              className="w-14 text-center mx-auto"
                              defaultValue={team.points}
                              onBlur={(e) => handleUpdateTeam(team, 'points', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          {sport?.uses_nrr && (
                            <td className="py-2">
                              <Input
                                type="number"
                                step="0.001"
                                className="w-20 text-center mx-auto"
                                defaultValue={team.net_run_rate}
                                onBlur={(e) => handleUpdateTeam(team, 'net_run_rate', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                          )}
                          {sport?.uses_gd && (
                            <td className="py-2">
                              <Input
                                type="number"
                                className="w-16 text-center mx-auto"
                                defaultValue={team.goal_difference}
                                onBlur={(e) => handleUpdateTeam(team, 'goal_difference', parseInt(e.target.value) || 0)}
                              />
                            </td>
                          )}
                          {sport?.uses_pd && (
                            <td className="py-2">
                              <Input
                                type="number"
                                className="w-16 text-center mx-auto"
                                defaultValue={team.point_difference}
                                onBlur={(e) => handleUpdateTeam(team, 'point_difference', parseInt(e.target.value) || 0)}
                              />
                            </td>
                          )}
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function GroupsTab() {
  const { data: groups, isLoading } = useAllGroups();
  const { data: sports } = useSports();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const [newGroup, setNewGroup] = useState({ sport_id: '', name: '' });

  const teamSports = sports?.filter((s) => s.category === 'team') || [];

  const handleAddGroup = () => {
    if (!newGroup.sport_id || !newGroup.name) {
      toast.error('Select a sport and enter group name');
      return;
    }
    createGroup.mutate(newGroup, {
      onSuccess: () => {
        toast.success('Group created!');
        setNewGroup({ sport_id: '', name: '' });
      },
      onError: () => toast.error('Failed to create group'),
    });
  };

  const handleDeleteGroup = (id: string) => {
    if (!confirm('This will also delete all teams in this group. Continue?')) return;
    deleteGroup.mutate(id, {
      onSuccess: () => toast.success('Group deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Group
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={newGroup.sport_id} onValueChange={(v) => setNewGroup({ ...newGroup, sport_id: v })}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select Team Sport" />
              </SelectTrigger>
              <SelectContent>
                {teamSports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.icon} {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Group Name (e.g., Group A)"
              className="flex-1"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <Button onClick={handleAddGroup} disabled={createGroup.isPending} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Groups ({groups?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups?.map((group: any) => {
              const sport = sports?.find((s) => s.id === group.sport_id);
              return (
                <div key={group.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sport?.icon}</span>
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">{sport?.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
