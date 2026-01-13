import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Delete, Check, X } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const { login, users } = useStore();

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 4) {
        const success = login(newPin);
        if (!success) {
          setError('Invalid PIN');
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPin('');
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const keypadButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'clear', '0', 'delete'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl shadow-soft-xl mb-4">
          🛒
        </div>
        <h1 className="text-3xl font-bold text-foreground">FreshFity</h1>
        <p className="text-muted-foreground">Supermarket POS</p>
      </div>

      {/* PIN Display */}
      <div className={cn(
        "flex flex-col items-center mb-8 animate-slide-up",
        isShaking && "animate-[shake_0.5s_ease-in-out]"
      )}>
        <p className="text-sm text-muted-foreground mb-4">Enter your PIN to continue</p>
        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-200",
                i < pin.length
                  ? "bg-primary scale-110"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs animate-slide-up">
        {keypadButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === 'clear') handleClear();
              else if (btn === 'delete') handleDelete();
              else handlePinInput(btn);
            }}
            className={cn(
              "keypad-btn",
              btn === 'delete' && "bg-secondary",
              btn === 'clear' && "bg-muted"
            )}
          >
            {btn === 'delete' ? (
              <Delete className="w-6 h-6" />
            ) : btn === 'clear' ? (
              <X className="w-6 h-6" />
            ) : (
              btn
            )}
          </button>
        ))}
      </div>

      {/* Quick Access (for demo) */}
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground mb-3">Quick Access (Demo)</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-sm">
          {users.filter(u => u.active).slice(0, 4).map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setPin('');
                user.pin.split('').forEach((digit, i) => {
                  setTimeout(() => handlePinInput(digit), i * 100);
                });
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
            >
              <span>{user.avatar}</span>
              <span className="text-muted-foreground">{user.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
