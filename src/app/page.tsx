'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { TopNavBar } from '@/components/dashboard/TopNavBar';
import { SummaryStrip } from '@/components/dashboard/SummaryStrip';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { ApplicationCard } from '@/components/dashboard/ApplicationCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { NewApplicationModal } from '@/components/modals/NewApplicationModal';
import { HydrationSafe } from '@/components/HydrationSafe';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

function DashboardContent() {
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>();
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
        
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-fade-in-down">
            <SummaryStrip />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FilterTabs />
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 animate-ping absolute inset-0" />
                <div className="h-12 w-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
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
          ) : (
            <div className="space-y-4">
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
        <div className="absolute inset-0 h-14 w-14 rounded-full bg-violet-500 animate-ping opacity-20" />
        <Button
          onClick={() => handleNewApplication()}
          className="relative h-14 w-14 rounded-full shadow-lg shadow-violet-500/30 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 hover:scale-110 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300"
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
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 overflow-hidden">
      {/* Animated Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-float-delayed" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      
      <HydrationSafe fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </HydrationSafe>
    </div>
  );
}
