'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { Project, FilterState, TabFilter, KRItem, SortOption } from '@/types/project';
import { useMounted } from '@/hooks/useMounted';
import { saveProjects, loadProjects, saveGlobalKRs, loadGlobalKRs, saveFilterState, loadFilterState } from '@/lib/supabaseService';

export default function ProjectsPage() {
  const mounted = useMounted();
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalKRs, setGlobalKRs] = useState<KRItem[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    showInitiative: true,
    showKR: true,
    showPlan: true,
    showDone: true,
    showFuture: true,
    sortBy: 'priority-asc'
  });
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Handle global KR changes
  const handleGlobalKRChange = (newKRs: KRItem[]) => {
    setGlobalKRs(newKRs);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!mounted) return;
    const autoSave = async () => {
      try {
        console.log('🔄 Starting auto-save...', { 
          projectsCount: projects.length, 
          globalKRsCount: globalKRs.length,
          filterState: filterState 
        });
        
        await Promise.all([
          saveProjects(projects),
          saveGlobalKRs(globalKRs),
          saveFilterState(filterState)
        ]);
        
        console.log('✅ Auto-save completed successfully');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [projects, globalKRs, filterState, mounted]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      try {
        const [loadedProjects, loadedGlobalKRs, loadedFilterState] = await Promise.all([
          loadProjects(),
          loadGlobalKRs(),
          loadFilterState()
        ]);
        
        setProjects(loadedProjects);
        setGlobalKRs(loadedGlobalKRs);
        
        if (loadedFilterState) {
          setFilterState(loadedFilterState);
        }
        
        // If no projects exist, create an empty one automatically
        if (loadedProjects.length === 0) {
          const emptyProject: Project = {
            id: `project-1`,
            priority: 1,
            name: '',
            plan: 'select',
            initiative: '',
            selectedKRs: [],
            designStatus: 'select',
            buildStatus: 'select',
            problemStatement: '',
            solution: '',
            successMetric: '',
            figmaLink: '',
            prdLink: '',
            customLinks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProjects([emptyProject]);
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        // Fallback: create empty project if load fails
        const emptyProject: Project = {
          id: `project-1`,
          priority: 1,
          name: '',
          plan: 'select',
          initiative: '',
          selectedKRs: [],
          designStatus: 'select',
          buildStatus: 'select',
          problemStatement: '',
          solution: '',
          successMetric: '',
          figmaLink: '',
          prdLink: '',
          customLinks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects([emptyProject]);
      }
    };
    
    loadData();
  }, [mounted]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id 
        ? { ...updatedProject, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const handleProjectReorder = (projectId: string, newPriority: number) => {
    setProjects(prev => {
      const updated = [...prev];
      const projectIndex = updated.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) return prev;
      
      const oldPriority = updated[projectIndex].priority;
      
      // Update the project's priority
      updated[projectIndex].priority = newPriority;
      
      // Adjust other projects' priorities
      updated.forEach((project, index) => {
        if (index !== projectIndex) {
          if (newPriority < oldPriority) {
            // Moving up in priority
            if (project.priority >= newPriority && project.priority < oldPriority) {
              project.priority += 1;
            }
          } else {
            // Moving down in priority
            if (project.priority > oldPriority && project.priority <= newPriority) {
              project.priority -= 1;
            }
          }
        }
      });
      
      return updated.sort((a, b) => a.priority - b.priority);
    });
  };

  const addNewProject = () => {
    const newProject: Project = {
      id: `project-${projects.length + 1}`,
      priority: projects.length + 1,
      name: '',
      plan: 'select',
      initiative: '',
      selectedKRs: [],
      designStatus: 'select',
      buildStatus: 'select',
      problemStatement: '',
      solution: '',
      successMetric: '',
      figmaLink: '',
      prdLink: '',
      customLinks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects(prev => [...prev, newProject]);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      // Reassign priorities after deletion
      return updated.map((project, index) => ({
        ...project,
        priority: index + 1
      }));
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and track your project progress
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Project Tracker
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage and track all your projects with real-time updates
          </p>
        </div>

        {/* Tab System */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <TabSystem 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              projects={projects}
            />
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <FilterBar
              filterState={filterState}
              onFilterChange={setFilterState}
              activeTab={activeTab}
            />
          </CardContent>
        </Card>

        {/* Project Table */}
        <div className="w-full">
          <ProjectTable
            projects={projects}
            globalKRs={globalKRs}
            onGlobalKRChange={handleGlobalKRChange}
            filterState={filterState}
            activeTab={activeTab}
            onProjectUpdate={handleProjectUpdate}
            onProjectReorder={handleProjectReorder}
            onSortChange={(sortOption: SortOption) => setFilterState({ ...filterState, sortBy: sortOption })}
            onProjectDelete={handleProjectDelete}
            onAddNewProject={addNewProject}
            showHoverRow={false}
            hoverRowLocked={false}
            onHoverRowLocked={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
