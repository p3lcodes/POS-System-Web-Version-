
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { API_BASE_URL } from '@/config/api';

export const LoginScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const { login, users } = useStore();

  // Sign Up state
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpRole, setSignUpRole] = useState('Cashier');
  const [signUpError, setSignUpError] = useState('');

  // PIN reset state and handlers
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');

  const handleWhatsAppReset = () => {
    const user = users.find(u => u.email === resetEmail);
    if (!user) {
      setResetError('Email not found. Please enter the email registered in the POS system.');
      return;
    }
    if (!user.whatsapp) {
      setResetError('No WhatsApp number found for this user.');
      return;
    }
    window.open(`https://wa.me/${user.whatsapp}?text=Please+reset+PIN+for+cashier+${user.name}`, '_blank');
    setResetError('');
  };

  const handleEmailReset = async () => {
    const user = users.find(u => u.email === resetEmail);
    if (!user) {
      setResetError('Email not found. Please enter the email registered in the POS system.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (data.success) {
        setResetError('Reset link sent to your email.');
      } else {
        setResetError(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      setResetError('Failed to send reset link.');
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        attemptLogin(newPin);
      }
    }
  };

  const attemptLogin = async (pinCode: string) => {
    const success = await login(pinCode);
    if (!success) {
      setError('Invalid PIN');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  const handleLogin = () => attemptLogin(pin);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-2 animate-fade-in">
        <div className="w-[500px] h-auto flex items-center justify-center mb-2">
            <img 
              src="/logo2.png" 
              alt="FreshFity Logo" 
              className="w-full h-auto object-contain"
            />
        </div>
        <p className="text-muted-foreground">Point of Sale System</p>
      </div>

      {/* Login or Sign Up */}
      {!showSignUp ? (
        <>
          {/* PIN Display */}
          <div className={cn(
            "flex flex-col items-center mb-4 animate-slide-up",
            isShaking && "animate-[shake_0.5s_ease-in-out]"
          )}>
            <p className="text-sm text-muted-foreground mb-4">Enter your PIN to continue</p>
            <div className="flex gap-3 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-200",
                    i < pin.length ? "bg-primary scale-110" : "bg-muted"
                  )}
                />
              ))}
            </div>
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs animate-slide-up mb-4">
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
          <div className="max-w-[200px] w-full mx-auto">
             <Button className="w-full mb-2 h-10 text-sm" onClick={handleLogin} disabled={pin.length !== 4}>Login</Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer underline hover:text-primary transition-colors justify-center mb-4" onClick={() => setShowSignUp(true)}>
             Staff Sign Up
          </p>

          {/* PIN Reset Options */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground mb-3 cursor-pointer underline" onClick={() => setShowReset(true)}>Forgot your PIN?</p>
            {showReset && (
              <div className="space-y-4">
                <Input
                  placeholder="Enter your email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="mb-2"
                />
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={handleWhatsAppReset}
                >
                  Reset PIN via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEmailReset}
                >
                  Reset PIN via Email
                </Button>
                {resetError && <p className="text-destructive text-sm mt-2">{resetError}</p>}
                <p className="text-xs text-muted-foreground mt-2">PIN changes in your main POS system will automatically sync here.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-xs animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Sign Up</h2>
          <Input className="mb-2" placeholder="Name" value={signUpName} onChange={e => setSignUpName(e.target.value)} />
          <Input className="mb-2" placeholder="Email" type="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} />
          <Input className="mb-2" placeholder="4-digit PIN" type="number" value={signUpPin} onChange={e => setSignUpPin(e.target.value)} maxLength={4} />
          <Input className="mb-2" placeholder="Role (Cashier/Manager)" value={signUpRole} onChange={e => setSignUpRole(e.target.value)} />
          {signUpError && <p className="text-destructive text-sm mb-2">{signUpError}</p>}
          <Button className="w-full mb-2" onClick={async () => {
            if (!signUpName || !signUpEmail || signUpPin.length !== 4 || !signUpRole) {
              setSignUpError('Please fill all fields and use a 4-digit PIN');
              return;
            }
            try {
              const res = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: signUpName, email: signUpEmail, pin: signUpPin, role: signUpRole })
              });
              const data = await res.json();
              if (data.success) {
                setShowSignUp(false);
                setSignUpName('');
                setSignUpEmail('');
                setSignUpPin('');
                setSignUpRole('Cashier');
                setSignUpError('');
                setPin(signUpPin);
                setError('');
              } else {
                setSignUpError(data.error || 'Sign up failed');
              }
            } catch (err) {
              setSignUpError('Sign up failed');
            }
          }}>Create Account</Button>
          <Button className="w-full" variant="outline" onClick={() => setShowSignUp(false)}>Back to Login</Button>
        </div>
      )}
    </div>
  );
};
