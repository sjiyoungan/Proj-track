'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { EditableHeader } from '@/components/EditableHeader';
import { EditableCell } from '@/components/EditableCell';
import { Project, FilterState, TabFilter, KRItem } from '@/types/project';
import { useMounted } from '@/hooks/useMounted';

export default function Home() {
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
  const [headerTitle, setHeaderTitle] = useState<string>('');
  const [showHoverRow, setShowHoverRow] = useState(false);
  const [hoverRowLocked, setHoverRowLocked] = useState(false);

  const handleHeaderTitleChange = (newTitle: string) => {
    setHeaderTitle(newTitle);
  };

  const handleGlobalKRChange = (newKRs: KRItem[]) => {
    setGlobalKRs(newKRs);
  };

  // Simple save function
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('headerTitle', headerTitle);
      localStorage.setItem('globalKRs', JSON.stringify(globalKRs));
      localStorage.setItem('filterState', JSON.stringify(filterState));
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    const savedProjects = localStorage.getItem('projects');
    const savedTitle = localStorage.getItem('headerTitle');
    const savedGlobalKRs = localStorage.getItem('globalKRs');
    const savedFilterState = localStorage.getItem('filterState');
    
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        const loadedProjects = parsed.map((p: any) => ({
          ...p,
          selectedKRs: Array.isArray(p.selectedKRs) ? p.selectedKRs : [],
          designStatus: p.designStatus || 'select',
          buildStatus: p.buildStatus || 'select',
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }));
        setProjects(loadedProjects);
        
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProjects([emptyProject]);
        }
      } catch (error) {
        console.error('❌ Failed to load projects:', error);
      }
    } else {
      // No saved projects at all - create initial empty project
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProjects([emptyProject]);
    }
    
    if (savedTitle) {
      setHeaderTitle(savedTitle);
    }

    if (savedGlobalKRs) {
      try {
        const parsed = JSON.parse(savedGlobalKRs);
        // Simple migration: ensure all KRs have required fields
        const migratedKRs = parsed.map((kr: any, index: number) => ({
          id: kr.id || `kr-migrated-${index}`,
          text: kr.text || '',
          fillColor: kr.fillColor || '#f3f4f6',
          textColor: kr.textColor || '#000000',
          order: kr.order || index
        }));
        
        setGlobalKRs(migratedKRs);
      } catch (error) {
        console.error('❌ Failed to load global KRs:', error);
        // If loading fails, use empty array
        setGlobalKRs([]);
      }
    } else {
      setGlobalKRs([]);
    }

          if (savedFilterState) {
            try {
              const parsed = JSON.parse(savedFilterState);
              // Add backward compatibility for showFuture
              if (parsed.showFuture === undefined) {
                parsed.showFuture = true;
              }
              setFilterState(parsed);
            } catch (error) {
              console.error('❌ Failed to load filter state:', error);
            }
          }
  }, [mounted]);

  // Auto-save when data changes
  useEffect(() => {
    if (!mounted) return;
    saveToLocalStorage();
  }, [projects, headerTitle, globalKRs, filterState, mounted]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id 
        ? { ...updatedProject, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const handlePriorityUpdate = (projectId: string, newPriority: number) => {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects(prev => [...prev, newProject]);
    setShowHoverRow(false); // Hide the hover row after adding
    
    // Focus the name field of the newly added project after a brief delay
    setTimeout(() => {
      const nameInputs = document.querySelectorAll('input[placeholder="Enter project"]');
      const lastNameInput = nameInputs[nameInputs.length - 1] as HTMLElement;
      if (lastNameInput) {
        lastNameInput.click(); // Trigger edit mode
      }
    }, 50);
  };

  const clearAllData = () => {
    localStorage.removeItem('projects');
    localStorage.removeItem('headerTitle');
    localStorage.removeItem('globalKRs');
    localStorage.removeItem('filterState');
    
    // Create an empty project just like on first load
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects([emptyProject]);
    setHeaderTitle('');
    setGlobalKRs([]);
    setFilterState({
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority-asc'
    });
  };

  const resetKRData = () => {
    localStorage.removeItem('globalKRs');
    setGlobalKRs([]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 w-fit">
            <div className="cursor-text hover:bg-slate-50 dark:hover:bg-slate-800 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors" style={{lineHeight:"1.2",paddingTop:"2px",paddingBottom:"2px",paddingLeft:"8px",paddingRight:"8px",height:"auto",minHeight:"40px",maxWidth:"fit-content",boxSizing:"border-box",display:"flex",alignItems:"center"}}>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Proj-tracker (rename)</span>
            </div>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EditableHeader
          title={headerTitle}
          onTitleChange={handleHeaderTitleChange}
        />

        {/* Tab System and Filter Bar */}
        <div className="flex justify-between items-center mb-4">
          <TabSystem 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            projects={projects}
          />
          <FilterBar
            filterState={filterState}
            onFilterChange={setFilterState}
            activeTab={activeTab}
          />
        </div>

        {/* Project Table */}
        <div>
          <Card className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-600">
            <CardContent 
              className="p-0"
              onMouseEnter={() => setShowHoverRow(false)}
            >
            <ProjectTable
              projects={projects}
              filterState={filterState}
              activeTab={activeTab}
              onProjectUpdate={handleProjectUpdate}
              onPriorityUpdate={handlePriorityUpdate}
              onSortChange={(sortOption) => setFilterState({ ...filterState, sortBy: sortOption })}
              onProjectDelete={handleProjectDelete}
                globalKRs={globalKRs}
                onGlobalKRChange={handleGlobalKRChange}
                onAddNewProject={addNewProject}
              />

              {/* Hover row - appears inside the table when hovering below */}
              {showHoverRow && (
                <div 
                  className="border-t border-slate-200 dark:border-slate-700"
                  onMouseEnter={() => setShowHoverRow(true)}
                  onMouseLeave={() => {
                    if (!hoverRowLocked) {
                      setShowHoverRow(false);
                    }
                  }}
                >
                  <table className="w-full table-fixed">
                    <tbody className="bg-white dark:bg-slate-900">
                      <tr 
                        className="bg-slate-50/50 dark:bg-slate-800/50 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={addNewProject}
                      >
                        <td className="py-4 whitespace-nowrap w-20" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                          <span className="text-sm text-slate-400 dark:text-slate-500" style={{ marginLeft: '30px' }}>
                            {projects.length + 1}
                          </span>
                        </td>
                        <td className="pl-0 pr-4 py-4 whitespace-nowrap w-48">
                          <EditableCell
                            value=""
                            onChange={() => {}}
                            placeholder="Enter project"
                          />
                        </td>
                        {filterState.showInitiative && (
                          <td className="px-4 py-4 whitespace-nowrap w-48"></td>
                        )}
                        {filterState.showKR && (
                          <td className="px-2 py-4 whitespace-nowrap w-32"></td>
                        )}
                        {filterState.showPlan && (
                          <td className="pl-0 pr-2 py-4 whitespace-nowrap w-32"></td>
                        )}
                        <td className="px-2 py-4 whitespace-nowrap w-28"></td>
                        <td className="px-2 py-4 whitespace-nowrap w-24"></td>
                        <td className="pr-0 py-4 whitespace-nowrap w-10"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
          </CardContent>
        </Card>

          {/* Hover zone to trigger the new row - only row height */}
          <div 
            className="h-16 w-full"
            onMouseEnter={() => setShowHoverRow(true)}
            onMouseLeave={() => {
              if (!hoverRowLocked) {
                setShowHoverRow(false);
              }
            }}
          />
        </div>

        {/* Add Project Button */}
        <div className="mt-6 flex justify-center">
          <Button onClick={addNewProject} className="px-8 py-3">
            Add Project
          </Button>
        </div>

        {/* Debug: Clear All Data Button (temporary) */}
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={clearAllData} variant="outline" className="text-sm">
            Clear All Data (Reset)
          </Button>
          <Button onClick={resetKRData} variant="outline" className="text-sm">
            Reset KR Data
          </Button>
        </div>
      </div>
    </div>
  );
}