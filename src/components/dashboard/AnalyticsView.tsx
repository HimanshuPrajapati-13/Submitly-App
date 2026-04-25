'use client';

import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Target, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';

export function AnalyticsView() {
  const { applications, getApplicationWithDetails } = useAppStore();
  
  // Calculate Stats
  const total = applications.length;
  const accepted = applications.filter(a => a.status === 'ACCEPTED').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;
  const submitted = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'RESULT_PENDING').length;
  const active = applications.filter(a => a.status === 'DRAFT' || a.status === 'IN_PROGRESS').length;
  
  const successRate = total > 0 ? Math.round((accepted / (accepted + rejected || 1)) * 100) : 0;
  const completionRate = total > 0 ? Math.round(((submitted + accepted + rejected) / total) * 100) : 0;

  const categories = ['JOB', 'COLLEGE', 'EXAM', 'SCHOLARSHIP', 'OTHER'];
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: applications.filter(a => a.category === cat).length,
    percentage: total > 0 ? Math.round((applications.filter(a => a.category === cat).length / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const urgencyStats = {
    red: 0,
    orange: 0,
    blue: 0,
    gray: 0
  };

  applications.forEach(app => {
    const details = getApplicationWithDetails(app.id);
    if (details) {
      if (details.urgencyLevel === 'red' || details.urgencyLevel === 'overdue') urgencyStats.red++;
      else if (details.urgencyLevel === 'orange') urgencyStats.orange++;
      else if (details.urgencyLevel === 'blue') urgencyStats.blue++;
      else urgencyStats.gray++;
    }
  });

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="h-20 w-20 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6">
          <BarChart3 className="h-10 w-10 text-slate-700" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No data to analyze yet</h3>
        <p className="text-slate-500 max-w-sm">Start adding applications to see your success rates and performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-linear-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-blue-300 uppercase tracking-wider">Success Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-white">{successRate}%</h2>
              <span className="text-xs text-blue-400/60 font-medium">based on outcomes</span>
            </div>
            <div className="mt-4 h-2 w-full bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-grow-horizontal" style={{ width: `${successRate}%` }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Completion</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-white">{completionRate}%</h2>
              <span className="text-xs text-emerald-400/60 font-medium">pipeline efficiency</span>
            </div>
            <div className="mt-4 h-2 w-full bg-emerald-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-grow-horizontal" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900/80 border-white/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-white">{total}</h2>
              <span className="text-xs text-slate-600 font-medium tracking-tight">Active tracking</span>
            </div>
            <div className="flex gap-1 mt-4">
                {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
                    <div key={i} className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="p-6 bg-slate-900/40 border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Category Distribution
          </h3>
          <div className="space-y-4">
            {categoryStats.map((stat, i) => (
              <div key={stat.name} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.name}</span>
                  <span className="text-xs font-mono text-white">{stat.count} <span className="text-slate-600 ml-1">({stat.percentage}%)</span></span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full border border-white/5">
                  <div 
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-blue-400 shadow-lg shadow-blue-500/10 transition-all duration-1000 ease-out" 
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Heatmap */}
        <Card className="p-6 bg-slate-900/40 border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Outcome tracking
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col items-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <span className="text-2xl font-black text-white">{accepted}</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Accepted</span>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col items-center">
                <XCircle className="h-8 w-8 text-red-500 mb-2" />
                <span className="text-2xl font-black text-white">{rejected}</span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Rejected</span>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex flex-col items-center">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-2xl font-black text-white">{submitted}</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Pending</span>
            </div>
            <div className="p-4 bg-slate-500/5 border border-white/5 rounded-2xl flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-2xl font-black text-white">{active}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Draft</span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Urgency levels</p>
            <div className="flex gap-2">
               <div className="flex-1">
                 <div className="h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold mb-1">{urgencyStats.red}</div>
                 <div className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-tighter">Urgent</div>
               </div>
               <div className="flex-1">
                 <div className="h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold mb-1">{urgencyStats.orange}</div>
                 <div className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-tighter">Rising</div>
               </div>
               <div className="flex-1">
                 <div className="h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold mb-1">{urgencyStats.blue}</div>
                 <div className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-tighter">Safe</div>
               </div>
               <div className="flex-1">
                 <div className="h-10 rounded-lg bg-slate-500/10 border border-white/5 flex items-center justify-center text-slate-500 font-bold mb-1">{urgencyStats.gray}</div>
                 <div className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-tighter">Draft</div>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
