import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck } from 'lucide-react';

interface AdminPinGateProps {
  onSuccess: () => void;
}

const ADMIN_PIN = '9494';

export function AdminPinGate({ onSuccess }: AdminPinGateProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take last character
    setPin(newPin);
    setError(false);

    // Move to next input if value entered
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (index === 3 && value) {
      const enteredPin = [...newPin.slice(0, 3), value.slice(-1)].join('');
      if (enteredPin === ADMIN_PIN) {
        onSuccess();
      } else {
        setError(true);
        setPin(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = pastedData.split('').slice(0, 4);
    while (newPin.length < 4) newPin.push('');
    setPin(newPin);

    if (newPin.join('') === ADMIN_PIN) {
      onSuccess();
    } else if (pastedData.length === 4) {
      setError(true);
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter the 4-digit PIN to access the admin panel
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoComplete="off"
                className={`w-14 h-14 text-center text-2xl font-bold ${
                  error ? 'border-destructive animate-shake' : ''
                }`}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-center text-sm text-destructive">
              Incorrect PIN. Please try again.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Protected access</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
