'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Mail, Lock, ArrowRight, Loader2, Github } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo with animation */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-down">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 animate-pulse-glow">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">Submitly</span>
            <span className="text-sm text-violet-400 font-medium">Submit On Time</span>
          </div>
        </div>

        {/* Card with glass effect */}
        <div className="glass rounded-2xl p-8 animate-fade-in-up shadow-2xl shadow-violet-500/10">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 mb-6">
            Sign in to manage your applications
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm animate-fade-in">
              {message}
            </div>
          )}

          {/* GitHub Login Button */}
          <Button
            type="button"
            onClick={handleGithubLogin}
            disabled={isGithubLoading || isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white h-12 mb-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10"
          >
            {isGithubLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Github className="h-5 w-5 mr-2" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/80 px-3 text-slate-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-violet-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-slate-800/80 border-white/10 text-white pl-10 placeholder:text-slate-500 h-11 transition-all focus:border-violet-500 focus:ring-violet-500/20 focus:bg-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-violet-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-800/80 border-white/10 text-white pl-10 placeholder:text-slate-500 h-11 transition-all focus:border-violet-500 focus:ring-violet-500/20 focus:bg-slate-800"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGithubLoading}
              className="w-full bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white h-12 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <button
                onClick={handleSignUp}
                disabled={isLoading}
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6 animate-fade-in">
          Never miss a deadline again <span className="inline-block animate-bounce">⚡</span>
        </p>
      </div>
    </div>
  );
}

