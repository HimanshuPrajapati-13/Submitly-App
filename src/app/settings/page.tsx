'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Mail, Save, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setFullName(user.user_metadata?.full_name || '');
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[80px] animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full hover:bg-white/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="clay-card border-0 p-8">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <User className="h-5 w-5" />
            </div>
            Profile
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500"/>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-xs font-bold uppercase tracking-wider pl-1">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="input-glass pl-11 h-12 text-slate-400 opacity-70"
                />
              </div>
              <p className="text-xs text-slate-500 pl-1">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400 text-xs font-bold uppercase tracking-wider pl-1">Display Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="input-glass pl-11 h-12 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="clay-button w-full mt-4 h-12 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin text-white/80" />
              ) : saved ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Saved Successfully</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-lg font-bold text-slate-700">Submitly</p>
          <p className="text-xs text-slate-600 uppercase tracking-widest">Mission Control v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
