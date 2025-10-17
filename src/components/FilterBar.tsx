'use client';

import { Badge } from '@/components/ui/badge';
import { FilterState, TabFilter } from '@/types/project';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeTab: TabFilter;
}

export function FilterBar({ filterState, onFilterChange, activeTab }: FilterBarProps) {
  return (
    <div className="flex items-center flex-wrap">
      {/* Done Chip - only show in 'all' tab */}
      {activeTab === 'all' && (
        <Badge
          variant="outline"
          className={`cursor-pointer hover:bg-primary/10 ml-2 first:ml-0 ${
            filterState.showDone 
              ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
              : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
          }`}
          onClick={() => onFilterChange({ ...filterState, showDone: !filterState.showDone })}
        >
          Done
        </Badge>
      )}

      {/* Future Chip - only show in 'all' tab */}
      {activeTab === 'all' && (
        <Badge
          variant="outline"
          className={`cursor-pointer hover:bg-primary/10 ml-2 ${
            filterState.showFuture 
              ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
              : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
          }`}
          onClick={() => onFilterChange({ ...filterState, showFuture: !filterState.showFuture })}
        >
          Future
        </Badge>
      )}

      {/* Initiative Chip */}
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-primary/10 ml-2 ${
          filterState.showInitiative 
            ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
            : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
        }`}
        onClick={() => onFilterChange({ ...filterState, showInitiative: !filterState.showInitiative })}
      >
        Initiative
      </Badge>

      {/* OKR Chip */}
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-primary/10 ml-2 ${
          filterState.showKR 
            ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
            : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
        }`}
        onClick={() => onFilterChange({ ...filterState, showKR: !filterState.showKR })}
      >
        KR
      </Badge>

      {/* Plan Chip */}
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-primary/10 ml-2 ${
          filterState.showPlan 
            ? 'border-slate-400 dark:border-slate-500 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
            : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400'
        }`}
        onClick={() => onFilterChange({ ...filterState, showPlan: !filterState.showPlan })}
      >
        Plan
      </Badge>

    </div>
  );
}
