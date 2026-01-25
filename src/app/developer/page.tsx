'use client';

import { ArrowLeft, Github, Linkedin, Mail, Globe, Code2, GraduationCap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900">
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
          <h1 className="text-2xl font-bold text-white">About the Developer</h1>
        </div>

        {/* Developer Card */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-8">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl font-bold text-white">
              H
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Himanshu Prajapati</h2>
            <p className="text-violet-400 font-medium">Full Stack Developer</p>
          </div>

          {/* Bio */}
          <p className="text-slate-300 text-center mb-6 leading-relaxed">
            Passionate about building beautiful and functional web applications and LOVES Music. 
            I created Submitly to help students and professionals never miss important deadlines 
            and stay organized with their applications.
          </p>

          {/* Stats/Info */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <Code2 className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Developer</p>
              <p className="text-slate-400 text-xs">Full Stack</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <GraduationCap className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Student</p>
              <p className="text-slate-400 text-xs">CURAJ</p>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <Heart className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Creator</p>
              <p className="text-slate-400 text-xs">Submitly</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3">
            <a 
              href="https://github.com/HimanshuPrajapati-13" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/himanshu-prajapati-728aa0201/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              LinkedIn
            </a>
            <a 
              href="mailto:2023IMSES011@curaj.ac.in"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
              Email
            </a>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-xl mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Tech Stack Used</h3>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'shadcn/ui', 'Zustand'].map((tech) => (
              <span 
                key={tech}
                className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Thanks */}
        <div className="text-center text-slate-400">
          <p>Thank you for using Submitly! ⚡</p>
          <p className="text-sm mt-2">
            If you have any feedback or suggestions, feel free to reach out.
          </p>
        </div>
      </div>
    </div>
  );
}
