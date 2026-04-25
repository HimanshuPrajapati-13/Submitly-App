'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { TopNavBar } from '@/components/dashboard/TopNavBar';
import { SummaryStrip } from '@/components/dashboard/SummaryStrip';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { ApplicationCard } from '@/components/dashboard/ApplicationCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { BoardView } from '@/components/dashboard/BoardView';
import { NewApplicationModal } from '@/components/modals/NewApplicationModal';
import { HydrationSafe } from '@/components/HydrationSafe';
import { LayoutList, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

function DashboardContent() {
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const hasLoadedRef = useRef(false);
  
  const { getFilteredApplications, activeFilter, loadFromSupabase, isLoading } = useAppStore();
  const applications = getFilteredApplications();

  // Load data from Supabase on mount (always on first render)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadFromSupabase();
    }
  }, [loadFromSupabase]);

  const handleNewApplication = (templateId?: string) => {
    setPreselectedTemplateId(templateId);
    setIsNewAppModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewAppModalOpen(false);
    setPreselectedTemplateId(undefined);
  };

  return (
    <>
      {/* Content */}
      <div className="relative z-10">
        <TopNavBar onNewApplication={handleNewApplication} />
        
        <main className={cn(
          "container mx-auto px-4 py-6 transition-all duration-500",
          viewMode === 'board' ? "max-w-7xl" : "max-w-4xl"
        )}>
          <div className="animate-fade-in-down">
            <SummaryStrip />
          </div>
          <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FilterTabs />
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5 mr-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-8 px-3 rounded-md transition-all text-xs font-bold uppercase tracking-wider",
                  viewMode === 'list' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                <LayoutList className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('board')}
                className={cn(
                  "h-8 px-3 rounded-md transition-all text-xs font-bold uppercase tracking-wider",
                  viewMode === 'board' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Board
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-blue-500/30 animate-ping absolute inset-0" />
                <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-400 mt-4 animate-pulse">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="animate-fade-in-up">
              <EmptyState 
                filter={activeFilter} 
                onNewApplication={() => handleNewApplication()} 
              />
            </div>
          ) : viewMode === 'board' ? (
            <div className="animate-fade-in-up">
              <BoardView />
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {applications.map((app, index) => (
                <div 
                  key={app.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ApplicationCard application={app} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="absolute inset-0 h-14 w-14 rounded-full bg-blue-500 animate-ping opacity-20" />
        <Button
          onClick={() => handleNewApplication()}
          className="relative h-14 w-14 rounded-full shadow-lg shadow-blue-500/30 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center"
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Modal */}
      <NewApplicationModal
        open={isNewAppModalOpen}
        onClose={handleCloseModal}
        preselectedTemplateId={preselectedTemplateId}
      />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="relative z-10">
      {/* Simple header placeholder */}
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl h-16" />
      
      {/* Loading indicator */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/ashboard-bg-2.png)' }}
        />
        
        {/* Overlays for depth */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950 via-slate-950/80 to-slate-900/90" />
        
        {/* Subtle decorative blobs for extra depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[80px] animate-float-delayed mix-blend-screen" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>
      
      <HydrationSafe fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </HydrationSafe>
    </div>
  );
}
