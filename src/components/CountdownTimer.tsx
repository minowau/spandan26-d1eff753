import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsLive(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isLive) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-semibold animate-pulse">
        <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-ping" />
        SPANDAN'26 IS LIVE!
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Timer className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Countdown to Spandan'26</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 font-display text-2xl md:text-3xl">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}