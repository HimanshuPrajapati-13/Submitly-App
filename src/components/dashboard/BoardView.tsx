'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Application, Status, statusLabels } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, AlertCircle, Inbox, Send, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

const COLUMNS: { id: string; label: string; icon: any; statuses: Status[]; color: string }[] = [
  { 
    id: 'backlog', 
    label: 'Backlog', 
    icon: Inbox, 
    statuses: ['DRAFT'],
    color: 'bg-slate-500'
  },
  { 
    id: 'in_progress', 
    label: 'Acting', 
    icon: Clock, 
    statuses: ['IN_PROGRESS'],
    color: 'bg-blue-500'
  },
  { 
    id: 'submitted', 
    label: 'Submitted', 
    icon: Send, 
    statuses: ['SUBMITTED', 'RESULT_PENDING'],
    color: 'bg-amber-500' 
  },
  { 
    id: 'done', 
    label: 'Outcome', 
    icon: CheckCircle2, 
    statuses: ['ACCEPTED', 'REJECTED', 'CLOSED'],
    color: 'bg-emerald-500'
  }
];

export function BoardView() {
  const { applications, updateApplication, getApplicationWithDetails } = useAppStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Fix for hydration issues with drag and drop
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Determine the target status based on the destination column
    const targetColumn = COLUMNS.find(c => c.id === destination.droppableId);
    if (!targetColumn) return;

    // Use the first status of the column as the target, except for 'submitted' and 'done'
    let newStatus: Status = targetColumn.statuses[0];
    if (targetColumn.id === 'submitted') newStatus = 'SUBMITTED';
    if (targetColumn.id === 'done') newStatus = 'ACCEPTED';
    
    updateApplication(draggableId, { status: newStatus });
  };

  if (!isMounted) return null;

  return (
    <div className="w-full h-full overflow-x-auto pb-6 scrollbar-hide">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4 px-4 h-[calc(100vh-280px)]">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter(app => column.statuses.includes(app.status));
            const Icon = column.icon;

            return (
              <div key={column.id} className="w-72 md:w-full flex flex-col h-full group">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg text-white shadow-sm", column.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-white tracking-tight">{column.label}</h3>
                    <span className="text-xs bg-white/5 text-slate-500 px-2 py-0.5 rounded-full border border-white/5 font-mono">
                      {columnApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 flex flex-col gap-3 p-3 rounded-2xl transition-colors min-h-[100px]",
                        snapshot.isDraggingOver ? "bg-blue-500/5 ring-1 ring-blue-500/20" : "bg-slate-900/40"
                      )}
                    >
                      {columnApps.map((app, index) => (
                        <Draggable key={app.id} draggableId={app.id} index={index}>
                          {(provided, snapshot) => {
                            const details = getApplicationWithDetails(app.id);
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => router.push(`/applications/${app.id}`)}
                                className={cn(
                                  "transition-transform duration-200",
                                  snapshot.isDragging ? "scale-105 z-50" : ""
                                )}
                              >
                                <Card className={cn(
                                  "p-3 bg-[#0b1220]/80 border-white/5 hover:border-blue-500/30 cursor-pointer shadow-sm group-hover:shadow-md transition-all active:scale-95",
                                  snapshot.isDragging && "shadow-2xl shadow-blue-500/20"
                                )}>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">{app.title}</h4>
                                      <div className={cn(
                                        "h-2 w-2 rounded-full shrink-0 mt-1",
                                        details?.urgencyLevel === 'red' || details?.urgencyLevel === 'overdue' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' :
                                        details?.urgencyLevel === 'orange' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                                        'bg-blue-500'
                                      )} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {app.category}
                                      </span>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <CheckSquare className="h-3 w-3 text-emerald-500/70" />
                                        <span>{(details?.steps || []).filter(s => s.completed).length}/{(details?.steps || []).length}</span>
                                      </div>
                                    </div>

                                    {details && (
                                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                                        <span className={cn(
                                          "text-[9px] font-bold uppercase tracking-tight",
                                          details.daysRemaining < 0 ? "text-red-400" : "text-slate-500"
                                        )}>
                                          {details.daysRemaining < 0 ? 'Overdue' : `${details.daysRemaining}d left`}
                                        </span>
                                        <span className="text-[9px] text-slate-600 italic">
                                          {formatDistanceToNow(new Date(app.updatedAt))} ago
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
