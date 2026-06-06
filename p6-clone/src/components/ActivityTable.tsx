import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useProjectStore } from '../store/projectStore';

interface ActivityTableProps {
  onScroll?: (scrollTop: number) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ onScroll, scrollRef }) => {
  const { activities, updateDuration, resources, assignments } = useProjectStore();

  const dataMap = React.useMemo(() => {
    const costMap = new Map<string, number>();
    const resMap = new Map<string, string[]>();
    
    const rates = new Map(resources.map(r => [r.id, r.standard_rate]));
    
    for (const a of assignments) {
      const currentCost = costMap.get(a.activity_id) || 0;
      const rate = rates.get(a.resource_id) || 0;
      costMap.set(a.activity_id, currentCost + (a.planned_units * rate));
      
      const resList = resMap.get(a.activity_id) || [];
      if (!resList.includes(a.resource_id)) resList.push(a.resource_id);
      resMap.set(a.activity_id, resList);
    }
    
    return { costs: costMap, resourcesStr: resMap };
  }, [assignments, resources]);

  const rowVirtualizer = useVirtualizer({
    count: activities.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32, // Altura de la fila (32px)
    overscan: 10,
  });

  return (
    <div className="w-[60%] h-full border-r border-p6border flex flex-col bg-p6panel overflow-x-auto overflow-y-hidden">
      {/* Header */}
      <div className="flex h-8 bg-zinc-800 border-b border-p6border text-xs font-semibold items-center px-2 shrink-0 min-w-max">
        <div className="w-20">Activity ID</div>
        <div className="w-48">Activity Name</div>
        <div className="w-20 text-center">Duration</div>
        <div className="w-24 text-center">Early Start</div>
        <div className="w-24 text-center">Early Finish</div>
        <div className="w-20 text-center">Float</div>
        <div className="w-32 text-center text-p6accent">Resources</div>
        <div className="w-24 text-right text-green-400">Total Cost</div>
      </div>

      {/* Virtualized Body */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-auto"
        onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const act = activities[virtualRow.index];
            const isCritical = act.total_float === 0;

            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 min-w-max flex items-center px-2 text-xs border-b border-zinc-800 hover:bg-zinc-700/50"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="w-20 font-mono text-gray-400">{act.id}</div>
                <div className="w-48 truncate pr-2">{act.name}</div>
                <div className="w-20 text-center">
                  <input 
                    type="number" 
                    className="w-12 bg-transparent text-center border border-transparent hover:border-gray-500 focus:border-p6accent focus:outline-none rounded"
                    value={act.duration}
                    onChange={(e) => updateDuration(act.id, parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="w-24 text-center">{act.early_start ?? '-'}</div>
                <div className="w-24 text-center">{act.early_finish ?? '-'}</div>
                <div className={`w-20 text-center font-bold ${isCritical ? 'text-red-400' : 'text-gray-400'}`}>
                  {act.total_float ?? '-'}
                </div>
                <div className="w-32 text-center text-gray-400 truncate text-[10px]">
                  {dataMap.resourcesStr.get(act.id)?.join(', ') || '-'}
                </div>
                <div className="w-24 text-right font-mono text-green-400/90">
                  ${(dataMap.costs.get(act.id) || 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
