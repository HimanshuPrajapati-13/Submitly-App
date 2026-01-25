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
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-violet-400" />
            Profile
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-800/50 border-white/10 text-slate-400 pl-10"
                />
              </div>
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="bg-slate-800 border-white/10 text-white pl-10 placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : saved ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Submitly - Submit On Time</p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
