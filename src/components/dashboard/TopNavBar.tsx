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
import { NotificationsDropdown } from './NotificationsDropdown';

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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b1220]/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md group-hover:bg-blue-400/30 transition-all duration-300" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-blue-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-tight tracking-tight">Submitly</span>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-tight">Submit on Time</span>
          </div>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="relative mx-4 flex-1 max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search applications... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full input-glass pl-10 h-10 text-sm focus:border-blue-500/50 text-white"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          {/* Templates Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
                <LayoutTemplate className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0b1220] border-white/10 backdrop-blur-xl">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Create
              </div>
              {TEMPLATES.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => onNewApplication(template.id)}
                  className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
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
          <NotificationsDropdown />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0b1220] border-white/10 backdrop-blur-xl">
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExportData}
                className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => router.push('/about')}
                className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                About App
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/developer')}
                className="text-slate-200 focus:bg-blue-600/20 focus:text-white cursor-pointer rounded-lg my-1"
              >
                <User className="h-4 w-4 mr-2" />
                About Developer
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer rounded-lg my-1"
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


