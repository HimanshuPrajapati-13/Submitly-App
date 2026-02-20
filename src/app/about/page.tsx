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
    <div className="min-h-screen bg-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[80px] animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full hover:bg-white/5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">About Submitly</h1>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Submitly <span className="text-blue-500">Submit On Time</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            The ultimate application tracker. Never miss a deadline, always know your next action.
          </p>
          <div className="mt-6 flex justify-center">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
              Version 1.0.0
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="clay-card border-0 p-6 hover:translate-y-[-2px] transition-transform duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-white font-bold mb-2 text-lg">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="clay-card border-0 p-8 mb-12">
          <h3 className="text-xl font-bold text-white mb-6">How It Works</h3>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/30">1</span>
              <div>
                <p className="text-white font-bold text-lg mb-1">Create an Application</p>
                <p className="text-slate-400 text-sm">Add your job, college, or scholarship application with a deadline.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/30">2</span>
              <div>
                <p className="text-white font-bold text-lg mb-1">Track Your Steps</p>
                <p className="text-slate-400 text-sm">Break down the application into steps. Check them off as you complete them.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/30">3</span>
              <div>
                <p className="text-white font-bold text-lg mb-1">Submit On Time</p>
                <p className="text-slate-400 text-sm">The app shows you what to do next. Never miss a deadline again!</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm pb-8">
          <p>Built with ❤️ using Next.js, Supabase, and Tailwind CSS and Music</p>
          <p className="mt-2">© 2026 Submitly. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
