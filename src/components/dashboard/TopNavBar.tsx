'use client';

import { Search, LayoutTemplate, Bell, User, Zap, LogOut, Settings, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface TopNavBarProps {
  onNewApplication: (templateId?: string) => void;
}

export function TopNavBar({ onNewApplication }: TopNavBarProps) {
  const { searchQuery, setSearchQuery, applications, steps } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      applications: applications,
      steps: steps,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submitly-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:shadow-violet-500/40 group-hover:scale-105">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-tight">Submitly</span>
            <span className="text-xs text-violet-400 font-medium leading-tight">Submit On Time</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mx-4 flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search applications... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border-white/10 pl-10 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                <LayoutTemplate className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">
                Quick Create from Template
              </div>
              {TEMPLATES.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => onNewApplication(template.id)}
                  className="text-slate-200 focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-slate-500">
                      {template.steps.length} steps • {template.estimatedHours}h
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10">
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportData}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => router.push('/about')}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <Zap className="h-4 w-4 mr-2" />
                About App
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/developer')}
                className="text-slate-200 focus:bg-white/10 cursor-pointer"
              >
                <User className="h-4 w-4 mr-2" />
                About Developer
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


