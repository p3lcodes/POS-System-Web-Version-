import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SignUpScreen: React.FC<{ onSignUp: () => void }> = ({ onSignUp }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSignUp = async () => {
    if (!name || !pin || !email) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin, email, role: 'owner' })
      });
      const data = await res.json();
      if (data.success) {
        onSignUp();
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (err) {
      setError('Sign up failed');
    }
  };

  const handleLogin = async () => {
    if (loginPin.length !== 4) {
      setLoginError('Enter a 4-digit PIN');
      return;
    }
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: loginPin })
      });
      const data = await res.json();
      if (data.success) {
        onSignUp();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">POS First-Time Setup</h1>
      <div className="w-full max-w-xs space-y-4">
        {showLogin ? (
          <>
            <Input placeholder="Enter PIN" type="password" value={loginPin} maxLength={4} onChange={e => setLoginPin(e.target.value)} />
            {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            <Button className="w-full" onClick={handleLogin}>Login</Button>
            <Button className="w-full mt-2" variant="outline" onClick={() => setShowLogin(false)}>Back to Sign Up</Button>
          </>
        ) : (
          <>
            <Input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="PIN (4 digits)" type="password" value={pin} maxLength={4} onChange={e => setPin(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button className="w-full" onClick={handleSignUp}>Sign Up</Button>
            <Button className="w-full mt-2" variant="outline" onClick={() => setShowLogin(true)}>Already have an account? Log In</Button>
          </>
        )}
      </div>
    </div>
  );
};
