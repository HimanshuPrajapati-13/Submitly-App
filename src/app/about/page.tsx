'use client';

import { ArrowLeft, Zap, CheckCircle2, Shield, Cloud, Clock, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutAppPage() {
  const features = [
    {
      icon: Clock,
      title: 'Deadline Intelligence',
      description: 'Never miss a deadline with smart priority calculations and urgency indicators.',
    },
    {
      icon: CheckCircle2,
      title: 'Step Tracking',
      description: 'Break down applications into manageable steps and track your progress.',
    },
    {
      icon: FileText,
      title: 'Templates',
      description: 'Start quickly with pre-built templates for jobs, colleges, scholarships, and exams.',
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Your data syncs across all devices. Never lose your progress.',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Your data is protected with enterprise-grade security from Supabase.',
    },
    {
      icon: Users,
      title: 'Easy to Use',
      description: 'Beautiful, intuitive interface designed for productivity.',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">About Submitly</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Submitly <span className="text-violet-400">Submit On Time</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            The ultimate application tracker. Never miss a deadline, always know your next action.
          </p>
          <p className="text-violet-400 font-medium mt-4">Version 1.0.0</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="bg-slate-900/50 border border-white/10 rounded-xl p-5 backdrop-blur-xl"
            >
              <feature.icon className="h-8 w-8 text-violet-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 font-bold text-sm shrink-0">1</span>
              <div>
                <p className="text-white font-medium">Create an Application</p>
                <p className="text-slate-400 text-sm">Add your job, college, or scholarship application with a deadline.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 font-bold text-sm shrink-0">2</span>
              <div>
                <p className="text-white font-medium">Track Your Steps</p>
                <p className="text-slate-400 text-sm">Break down the application into steps. Check them off as you complete them.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 font-bold text-sm shrink-0">3</span>
              <div>
                <p className="text-white font-medium">Submit On Time</p>
                <p className="text-slate-400 text-sm">The app shows you what to do next. Never miss a deadline again!</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>Built with ❤️ using Next.js, Supabase, and Tailwind CSS</p>
          <p className="mt-2">© 2026 Submitly. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
