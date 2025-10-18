'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TabFilter, Project } from '@/types/project';

interface TabSystemProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  projects: Project[];
}

export function TabSystem({ activeTab, onTabChange, projects }: TabSystemProps) {
  // Calculate counts based on design status only
  const getTabCount = (tabId: TabFilter): number => {
    switch (tabId) {
      case 'all':
        return projects.length;
      case 'in-progress':
        return projects.filter(p => p.designStatus === 'In progress').length;
      case 'not-started':
        return projects.filter(p => p.designStatus === 'Not started').length;
      case 'on-hold':
        return projects.filter(p => p.designStatus === 'On hold').length;
      case 'done':
        return projects.filter(p => p.designStatus === 'Done').length;
      case 'future':
        return projects.filter(p => p.designStatus === 'Future').length;
      default:
        return 0;
    }
  };

  const tabs = [
    { id: 'all' as TabFilter, label: 'All', count: getTabCount('all') },
    { id: 'in-progress' as TabFilter, label: 'In Progress', count: getTabCount('in-progress') },
    { id: 'not-started' as TabFilter, label: 'Not Started', count: getTabCount('not-started') },
    { id: 'on-hold' as TabFilter, label: 'On Hold', count: getTabCount('on-hold') },
    { id: 'done' as TabFilter, label: 'Done', count: getTabCount('done') },
    { id: 'future' as TabFilter, label: 'Future', count: getTabCount('future') },
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
              className="text-[9px] px-1 py-0.5 h-3.5 min-w-3.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
