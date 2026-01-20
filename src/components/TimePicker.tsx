import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  // Parse existing value (format: "HH:MM" or "H:MM AM/PM")
  const parseTime = (timeStr: string): { hour: string; minute: string } => {
    if (!timeStr) return { hour: '09', minute: '00' };
    
    // Try to parse 24h format first (HH:MM)
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      return { 
        hour: match24[1].padStart(2, '0'), 
        minute: match24[2] 
      };
    }
    
    // Try 12h format (H:MM AM/PM)
    const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let hour = parseInt(match12[1]);
      const isPM = match12[3].toUpperCase() === 'PM';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      return { 
        hour: hour.toString().padStart(2, '0'), 
        minute: match12[2] 
      };
    }
    
    return { hour: '09', minute: '00' };
  };

  const { hour, minute } = parseTime(value);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Generate minutes (00, 15, 30, 45 for convenience, plus all options)
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="flex items-center gap-1">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-bold">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
