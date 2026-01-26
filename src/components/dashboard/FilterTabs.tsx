'use client';

import { useAppStore } from '@/lib/store';
import { FilterTab } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'active', label: 'Active' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'closed', label: 'Closed' },
];

export function FilterTabs() {
  const { activeFilter, setActiveFilter, applications, getFilteredApplications } = useAppStore();
  
  // Calculate counts for each filter
  const getCounts = () => {
    const allApps = useAppStore.getState().applications;
    const store = useAppStore.getState();
    
    return {
      all: allApps.length,
      urgent: allApps.filter(app => {
        const details = store.getApplicationWithDetails(app.id);
        return details && (details.daysRemaining <= 7 || details.daysRemaining < 0);
      }).length,
      active: allApps.filter(app => 
        app.status === 'DRAFT' || app.status === 'IN_PROGRESS'
      ).length,
      submitted: allApps.filter(app => 
        app.status === 'SUBMITTED' || app.status === 'RESULT_PENDING'
      ).length,
      closed: allApps.filter(app => 
        app.status === 'ACCEPTED' || app.status === 'REJECTED' || app.status === 'CLOSED'
      ).length,
    };
  };

  const counts = getCounts();

  return (
    <div className="px-4 pb-4">
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
        <TabsList className="w-full justify-start gap-1 bg-slate-900/50 p-1 h-auto flex-wrap">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-md transition-all duration-300"
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                {counts[tab.key]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
