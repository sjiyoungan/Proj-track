'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TabFilter } from '@/types/project';

interface TabSystemProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
}

export function TabSystem({ activeTab, onTabChange }: TabSystemProps) {
  const tabs = [
    { id: 'all' as TabFilter, label: 'All', count: 12 },
    { id: 'in-progress' as TabFilter, label: 'In Progress', count: 5 },
    { id: 'not-started' as TabFilter, label: 'Not Started', count: 4 },
    { id: 'on-hold' as TabFilter, label: 'On Hold', count: 2 },
    { id: 'done' as TabFilter, label: 'Done', count: 1 },
  ];

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabFilter)} className="w-fit">
      <TabsList className="inline-flex h-auto p-0 bg-transparent border-none shadow-none">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent hover:text-foreground relative"
          >
            {tab.label}
            <Badge 
              variant={activeTab === tab.id ? "default" : "secondary"}
              className="text-[9px] px-1 py-0.5 h-3.5 min-w-3.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
