import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileJson, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkImportProps {
  type: 'matches' | 'teams' | 'groups';
  onSuccess: () => void;
}

const templates = {
  matches: [
    {
      sport_id: "cricket",
      match_name: "Team A vs Team B",
      match_date: "22",
      match_time: "9:00 AM",
      venue: "Ground 1",
      team_a: "Team A",
      team_b: "Team B",
      match_type: "group",
      group_name: "Group A",
      status: "upcoming"
    }
  ],
  teams: [
    {
      group_id: "uuid-of-group",
      name: "Team Name",
      matches_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      net_run_rate: 0,
      goal_difference: 0,
      point_difference: 0
    }
  ],
  groups: [
    {
      sport_id: "cricket",
      name: "Group A"
    }
  ]
};

const csvTemplates = {
  matches: `sport_id,match_name,match_date,match_time,venue,team_a,team_b,match_type,group_name,status
cricket,Team A vs Team B,22,9:00 AM,Ground 1,Team A,Team B,group,Group A,upcoming
football,Team C vs Team D,22,10:00 AM,Field 2,Team C,Team D,group,Group B,upcoming`,
  teams: `group_id,name,matches_played,wins,losses,draws,points,net_run_rate,goal_difference,point_difference
uuid-of-group,Team Name,0,0,0,0,0,0,0,0`,
  groups: `sport_id,name
cricket,Group A
cricket,Group B
football,Group A`
};

function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: any = {};
    headers.forEach((header, index) => {
      let value: any = values[index] || '';
      // Convert numeric fields
      if (['matches_played', 'wins', 'losses', 'draws', 'points', 'goal_difference', 'point_difference'].includes(header)) {
        value = parseInt(value) || 0;
      } else if (header === 'net_run_rate') {
        value = parseFloat(value) || 0;
      }
      row[header] = value;
    });
    data.push(row);
  }
  
  return data;
}

export function BulkImport({ type, onSuccess }: BulkImportProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'json' | 'csv'>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.name.endsWith('.csv')) {
        setCsvInput(content);
        setImportMode('csv');
      } else {
        setJsonInput(content);
        setImportMode('json');
      }
      setErrors([]);
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const downloadTemplate = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const template = JSON.stringify(templates[type], null, 2);
      const blob = new Blob([template], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const template = csvTemplates[type];
      const blob = new Blob([template], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const validateData = (data: any[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
      setErrors(['No valid data found']);
      return false;
    }
    
    const validationErrors: string[] = [];
    
    data.forEach((item, index) => {
      if (type === 'matches') {
        if (!item.sport_id) validationErrors.push(`Row ${index + 1}: Missing sport_id`);
        if (!item.match_name && (!item.team_a || !item.team_b)) {
          validationErrors.push(`Row ${index + 1}: Missing match_name or team_a/team_b`);
        }
        if (!item.match_date) validationErrors.push(`Row ${index + 1}: Missing match_date`);
        if (!item.match_time) validationErrors.push(`Row ${index + 1}: Missing match_time`);
      } else if (type === 'teams') {
        if (!item.group_id) validationErrors.push(`Row ${index + 1}: Missing group_id`);
        if (!item.name) validationErrors.push(`Row ${index + 1}: Missing name`);
      } else if (type === 'groups') {
        if (!item.sport_id) validationErrors.push(`Row ${index + 1}: Missing sport_id`);
        if (!item.name) validationErrors.push(`Row ${index + 1}: Missing name`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors.slice(0, 10)); // Show max 10 errors
      if (validationErrors.length > 10) {
        setErrors(prev => [...prev, `... and ${validationErrors.length - 10} more errors`]);
      }
      return false;
    }

    return true;
  };

  const parseInput = (): any[] | null => {
    setErrors([]);
    
    if (importMode === 'csv') {
      if (!csvInput.trim()) {
        setErrors(['Please enter CSV data']);
        return null;
      }
      const data = parseCSV(csvInput);
      return validateData(data) ? data : null;
    } else {
      if (!jsonInput.trim()) {
        setErrors(['Please enter JSON data']);
        return null;
      }
      try {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) {
          setErrors(['JSON must be an array of items']);
          return null;
        }
        return validateData(parsed) ? parsed : null;
      } catch (e) {
        setErrors(['Invalid JSON format']);
        return null;
      }
    }
  };

  const handleImport = async () => {
    const data = parseInput();
    if (!data) return;

    setIsLoading(true);
    try {
      const preparedData = data.map((item) => {
        if (type === 'matches') {
          const matchName = item.team_a && item.team_b 
            ? `${item.team_a} vs ${item.team_b}` 
            : item.match_name;
          return {
            sport_id: item.sport_id,
            match_name: matchName,
            match_date: String(item.match_date),
            match_time: item.match_time,
            venue: item.venue || null,
            team_a: item.team_a || null,
            team_b: item.team_b || null,
            match_type: item.match_type || 'group',
            group_name: item.group_name || null,
            status: item.status || 'upcoming',
            live_stream_url: item.live_stream_url || null,
          };
        } else if (type === 'teams') {
          return {
            group_id: item.group_id,
            name: item.name,
            matches_played: item.matches_played ?? 0,
            wins: item.wins ?? 0,
            losses: item.losses ?? 0,
            draws: item.draws ?? 0,
            points: item.points ?? 0,
            net_run_rate: item.net_run_rate ?? 0,
            goal_difference: item.goal_difference ?? 0,
            point_difference: item.point_difference ?? 0,
          };
        } else {
          return {
            sport_id: item.sport_id,
            name: item.name,
          };
        }
      });

      const { error } = await supabase.from(type).insert(preparedData);
      
      if (error) throw error;

      toast.success(`Successfully imported ${data.length} ${type}!`);
      setJsonInput('');
      setCsvInput('');
      onSuccess();
    } catch (error: any) {
      console.error('Import error:', error);
      setErrors([error.message || 'Failed to import data']);
      toast.error('Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const currentInput = importMode === 'csv' ? csvInput : jsonInput;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="w-5 h-5" />
          Import {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={importMode} onValueChange={(v) => setImportMode(v as 'json' | 'csv')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="text-xs">
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="w-3 h-3 mr-1" />
              JSON
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-3 mt-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>
                <Download className="w-3 h-3 mr-1" />
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <FileSpreadsheet className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>
            <Textarea
              placeholder={`Paste CSV data here...\n\n${csvTemplates[type]}`}
              value={csvInput}
              onChange={(e) => { setCsvInput(e.target.value); setErrors([]); }}
              className="min-h-[150px] font-mono text-xs"
            />
          </TabsContent>
          
          <TabsContent value="json" className="space-y-3 mt-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate('json')}>
                <Download className="w-3 h-3 mr-1" />
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <FileJson className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>
            <Textarea
              placeholder={`Paste JSON array here...\n\n${JSON.stringify(templates[type], null, 2)}`}
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setErrors([]); }}
              className="min-h-[150px] font-mono text-xs"
            />
          </TabsContent>
        </Tabs>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
            <div className="flex items-center gap-1 text-destructive mb-1">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium text-xs">Errors</span>
            </div>
            <ul className="text-xs text-destructive space-y-0.5">
              {errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!currentInput.trim() || isLoading}
          className="w-full"
          size="sm"
        >
          {isLoading ? 'Importing...' : `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
