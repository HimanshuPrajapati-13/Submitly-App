'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, ArrowRight, Loader2, Github, UserPlus, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      await handleLogin();
    } else {
      await handleSignUp();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGithubLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          setError(signInError.message);
          setIsLoading(false);
        } else {
          window.location.href = '/';
        }
        return;
      }
      
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.user && data.session) {
      window.location.href = '/';
      return;
    }

    if (data.user && !data.session) {
      setMessage('Check your email for a confirmation link!');
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      setError('Account created! Please try signing in.');
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* ATMOSPHERIC BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Deep space horizon glow - Amber/Warm */}
        <div className="absolute bottom-[-20%] left-[20%] right-[20%] h-[50vh] bg-amber-500/5 rounded-[100%] blur-[120px] opacity-30 animate-pulse-soft" />
        
        {/* Cool blue atmospheric bloom */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[80px] animate-float-delayed" />
        
        {/* Subtle star field grain overlay could go here if needed */}
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {/* MISSION CONTROL LOGO */}
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-down">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl group-hover:bg-blue-400/40 transition-all duration-500" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl clay-card bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 group-hover:-translate-y-1 transition-transform duration-500">
              <Zap className="h-10 w-10 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Submitly</h1>
            <p className="text-blue-300/80 font-medium tracking-wide text-sm uppercase letter-spacing-2">Mission Control</p>
          </div>
        </div>

        {/* CLAY CARD CONTAINER */}
        <div className="clay-card w-full p-8 animate-fade-in-up">
          
          {/* MODE TOGGLE - PILL SHAPE */}
          <div className="flex p-1.5 bg-slate-950/40 rounded-full mb-8 border border-white/5 relative overflow-hidden backdrop-blur-md shadow-inner">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={cn(
                "flex-1 text-sm font-semibold py-2.5 rounded-full transition-all duration-300 relative z-10",
                mode === 'signin' 
                  ? "text-white text-shadow-sm" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={cn(
                "flex-1 text-sm font-semibold py-2.5 rounded-full transition-all duration-300 relative z-10",
                mode === 'signup' 
                  ? "text-white text-shadow-sm" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Sign Up
            </button>
            
            {/* Sliding Background for Toggle */}
            <div 
              className={cn(
                "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 ease-out",
                mode === 'signin' ? "left-1.5" : "left-[calc(50%+3px)]"
              )}
            />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-white/90 mb-1">
              {mode === 'signin' ? 'Identify Yourself' : 'New Recruit'}
            </h2>
            <p className="text-slate-400 text-sm">
              {mode === 'signin' 
                ? 'Access your command center' 
                : 'Initialize your mission data protocols'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3 animate-fade-in shadow-inner">
              <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-3 animate-fade-in shadow-inner">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {message}
            </div>
          )}

          {/* SOCIAL LOGIN */}
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isGithubLoading || isLoading}
            className="w-full bg-slate-800/80 hover:bg-slate-700/80 text-white h-12 rounded-2xl mb-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            {isGithubLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            ) : (
              <>
                <Github className="h-5 w-5 text-white/90" />
                <span className="font-medium tracking-wide">Continue with GitHub</span>
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0b1220]/80 backdrop-blur px-3 text-slate-600">Secure Access</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-xs font-bold uppercase tracking-wider pl-1">Email Coordinates</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="input-glass pl-12 h-12 border-white/5 focus:border-blue-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 text-xs font-bold uppercase tracking-wider pl-1">Passkey</Label>
              <div className="relative group">
                {mode === 'signin' ? (
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                ) : (
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                )}
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-12 h-12 border-white/5 focus:border-blue-500/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGithubLoading}
              className="w-full clay-button h-14 mt-4 font-bold tracking-wide text-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white/80" />
              ) : mode === 'signin' ? (
                <>
                  <span className="drop-shadow-sm">Initialize Session</span>
                  <ArrowRight className="h-5 w-5 ml-1 animate-pulse" />
                </>
              ) : (
                <>
                  <span className="drop-shadow-sm">Register Identity</span>
                  <UserPlus className="h-5 w-5 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
            System Online • Secure Connection
          </p>
        </div>
      </div>
    </div>
  );
}

