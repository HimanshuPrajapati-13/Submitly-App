'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { ApplicationHeader } from '@/components/application/ApplicationHeader';
import { ProgressSection } from '@/components/application/ProgressSection';
import { StepsList } from '@/components/application/StepsList';
import { NotesSection } from '@/components/application/NotesSection';
import { HydrationSafe } from '@/components/HydrationSafe';
import { useAppStore } from '@/lib/store';

interface PageProps {
  params: Promise<{ id: string }>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl h-32" />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </main>
    </div>
  );
}

function ApplicationDetailContent({ id }: { id: string }) {
  const { getApplicationWithDetails } = useAppStore();
  const application = getApplicationWithDetails(id);

  if (!application) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Application not found</h2>
          <p className="text-slate-400">This application may have been deleted or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[80px] animate-float-delayed" />
      </div>
      
      <ApplicationHeader application={application} />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6 relative z-10">
        <ProgressSection application={application} />
        
        <StepsList 
          applicationId={application.id} 
          steps={application.steps} 
        />
        
        <NotesSection 
          applicationId={application.id}
          initialNotes={application.notes}
        />
      </main>
    </div>
  );
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  return (
    <HydrationSafe fallback={<LoadingSkeleton />}>
      <ApplicationDetailContent id={id} />
    </HydrationSafe>
  );
}

