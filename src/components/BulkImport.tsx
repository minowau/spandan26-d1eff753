import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileJson, Download, AlertCircle } from 'lucide-react';
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

export function BulkImport({ type, onSuccess }: BulkImportProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      setErrors([]);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = JSON.stringify(templates[type], null, 2);
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateAndParse = (): any[] | null => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setErrors(['JSON must be an array of items']);
        return null;
      }
      if (parsed.length === 0) {
        setErrors(['Array cannot be empty']);
        return null;
      }
      
      const validationErrors: string[] = [];
      
      parsed.forEach((item, index) => {
        if (type === 'matches') {
          if (!item.sport_id) validationErrors.push(`Item ${index + 1}: Missing sport_id`);
          if (!item.match_name && (!item.team_a || !item.team_b)) {
            validationErrors.push(`Item ${index + 1}: Missing match_name or team_a/team_b`);
          }
          if (!item.match_date) validationErrors.push(`Item ${index + 1}: Missing match_date`);
          if (!item.match_time) validationErrors.push(`Item ${index + 1}: Missing match_time`);
        } else if (type === 'teams') {
          if (!item.group_id) validationErrors.push(`Item ${index + 1}: Missing group_id`);
          if (!item.name) validationErrors.push(`Item ${index + 1}: Missing name`);
        } else if (type === 'groups') {
          if (!item.sport_id) validationErrors.push(`Item ${index + 1}: Missing sport_id`);
          if (!item.name) validationErrors.push(`Item ${index + 1}: Missing name`);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return null;
      }

      return parsed;
    } catch (e) {
      setErrors(['Invalid JSON format']);
      return null;
    }
  };

  const handleImport = async () => {
    setErrors([]);
    const data = validateAndParse();
    if (!data) return;

    setIsLoading(true);
    try {
      // Prepare data for insert
      const preparedData = data.map((item) => {
        if (type === 'matches') {
          const matchName = item.team_a && item.team_b 
            ? `${item.team_a} vs ${item.team_b}` 
            : item.match_name;
          return {
            sport_id: item.sport_id,
            match_name: matchName,
            match_date: item.match_date,
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
      onSuccess();
    } catch (error: any) {
      console.error('Import error:', error);
      setErrors([error.message || 'Failed to import data']);
      toast.error('Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Import {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileJson className="w-4 h-4 mr-2" />
            Upload JSON File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div>
          <Label className="mb-2 block">JSON Data</Label>
          <Textarea
            placeholder={`Paste your JSON array here or upload a file...\n\nExample:\n${JSON.stringify(templates[type], null, 2)}`}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setErrors([]);
            }}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!jsonInput.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Importing...' : `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Download the template to see the required format, fill in your data, then upload or paste the JSON.
        </p>
      </CardContent>
    </Card>
  );
}
