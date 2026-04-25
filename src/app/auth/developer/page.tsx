'use client';

import { ArrowLeft, Github, Twitter, Linkedin, Mail, ExternalLink, Code2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthDeveloperPage() {
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
          <Button onClick={() => window.location.href = '/auth/login'} variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full hover:bg-white/5">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white tracking-tight">About Developer</h1>
        </div>

        {/* Profile Section */}
        <div className="clay-card border-0 p-6 md:p-8 mb-8 text-center animate-fade-in-down">
          <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/20 mb-6 bg-slate-800 flex items-center justify-center">
            {/* Replace with actual image in production */}
            <Code2 className="h-16 w-16 text-blue-400" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Himanshu Prajapati</h2>
          <p className="text-blue-400 font-medium mb-6 text-sm md:text-base">Full Stack Developer & Human</p>
          
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-8 text-sm md:text-base px-2">
            Passionate about building tools that solve real-world problems. 
            Created Submitly to help students and professionals manage the chaos 
            of multiple high-stakes applications.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <a href="https://github.com/himanshu" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                <Github className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://twitter.com/himanshu" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                <Twitter className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://www.linkedin.com/in/himanshu-prajapati-728aa0201/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                <Linkedin className="h-5 w-5" />
              </Button>
            </a>
            <a href="mailto:workingadi300@gmail.com">
              <Button variant="outline" size="icon" className="rounded-full bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                <Mail className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="clay-card border-0 p-6 md:p-8 mb-8 animate-fade-in-up">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Built With
          </h3>
          <div className="flex flex-wrap gap-3">
            {['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Zustand', 'Lucide Icons'].map((tech) => (
              <span 
                key={tech}
                className="px-4 py-2 bg-slate-900/50 border border-white/5 rounded-lg text-slate-300 text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Other Projects CTA */}
        <a 
          href="https://github.com/himanshu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-blue-600/30 transition-colors group">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Check out my other projects</h3>
              <p className="text-slate-400 text-sm">Explore more open source tools and applications</p>
            </div>
            <Button className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-full group-hover:scale-105 transition-transform">
              View GitHub <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </a>
      </div>
    </div>
  );
}
