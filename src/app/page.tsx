'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { EditableHeader } from '@/components/EditableHeader';
import { EditableCell } from '@/components/EditableCell';
import { AuthForm } from '@/components/AuthForm';
import { Project, FilterState, TabFilter, KRItem } from '@/types/project';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from '@/contexts/AuthContext';
import { saveProjects, loadProjects, saveGlobalKRs, loadGlobalKRs, saveFilterState, loadFilterState } from '@/lib/supabaseService';

export default function Home() {
  const mounted = useMounted();
  const { user, loading: authLoading } = useAuth();
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

  // Save to Supabase
  const saveToSupabase = async () => {
    try {
      // If in share mode (no user), save to localStorage instead
      if (!user && window.location.search.includes('share=true')) {
        localStorage.setItem('shared-projects', JSON.stringify(projects));
        localStorage.setItem('shared-globalKRs', JSON.stringify(globalKRs));
        localStorage.setItem('shared-filterState', JSON.stringify(filterState));
        localStorage.setItem('shared-headerTitle', headerTitle);
        return;
      }
      
      await Promise.all([
        saveProjects(projects),
        saveGlobalKRs(globalKRs),
        saveFilterState(filterState)
      ]);
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      try {
        // If in share mode (no user), load from localStorage instead
        if (!user && window.location.search.includes('share=true')) {
          const sharedProjects = localStorage.getItem('shared-projects');
          const sharedGlobalKRs = localStorage.getItem('shared-globalKRs');
          const sharedFilterState = localStorage.getItem('shared-filterState');
          const sharedHeaderTitle = localStorage.getItem('shared-headerTitle');

          if (sharedProjects) {
            setProjects(JSON.parse(sharedProjects));
          }
          if (sharedGlobalKRs) {
            setGlobalKRs(JSON.parse(sharedGlobalKRs));
          }
          if (sharedFilterState) {
            setFilterState(JSON.parse(sharedFilterState));
          }
          if (sharedHeaderTitle) {
            setHeaderTitle(sharedHeaderTitle);
          }

          // If no shared data exists, create empty project
          if (!sharedProjects) {
            const emptyProject: Project = {
              id: `project-${Date.now()}`,
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
          return;
        }

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

        // Load header title
        const savedTitle = localStorage.getItem('headerTitle');
        if (savedTitle) {
          setHeaderTitle(savedTitle);
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
  }, [mounted, user]);

  // Auto-save when data changes
  useEffect(() => {
    if (!mounted) return;
    saveToSupabase();
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
      customLinks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProjects(prev => [...prev, newProject]);
    setShowHoverRow(false); // Hide the hover row after adding
    
    // Focus the name field of the newly added project after a brief delay
    setTimeout(() => {
      // Get all table rows
      const rows = document.querySelectorAll('tbody tr:not([class*="cursor-pointer"])');
      const lastRow = rows[rows.length - 1];
      
      if (lastRow) {
        // Find the name field (second td, first editable cell)
        const nameCell = lastRow.querySelector('td:nth-child(2) [class*="cursor-text"]') as HTMLElement;
        if (nameCell) {
          console.log('Clicking name cell to enter edit mode');
          nameCell.click();
        }
      }
    }, 150);
  };

  const clearAllData = async () => {
    try {
      // Clear all data from Supabase
      await Promise.all([
        saveProjects([]),
        saveGlobalKRs([]),
        saveFilterState({
          showInitiative: true,
          showKR: true,
          showPlan: true,
          showDone: true,
          showFuture: true,
          sortBy: 'priority-asc'
        })
      ]);
      
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
        customLinks: [],
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
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  };

  const resetKRData = async () => {
    try {
      await saveGlobalKRs([]);
      setGlobalKRs([]);
    } catch (error) {
      console.error('❌ Failed to reset KR data:', error);
    }
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

  // Authentication checks - optional for sharing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth form only if no user and not in share mode
  if (!user && !window.location.search.includes('share=true')) {
    return <AuthForm />;
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
              globalKRs={globalKRs}
              filterState={filterState}
              activeTab={activeTab}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
              onProjectReorder={handleProjectReorder}
              onGlobalKRChange={handleGlobalKRChange}
              onAddNewProject={addNewProject}
              showHoverRow={showHoverRow}
              hoverRowLocked={hoverRowLocked}
              onHoverRowLocked={setHoverRowLocked}
              onSortChange={(sortOption) => setFilterState({ ...filterState, sortBy: sortOption })}
            />

              {/* Hover row - appears inside the table when hovering below (only on "all" tab) */}
              {showHoverRow && activeTab === 'all' && (
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
                            placeholder="Enter name to add project"
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


      </div>
    </div>
  );
  // Authentication checks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-600">
          <CardContent className="p-0">
            <EditableHeader 
              title={headerTitle}
              onTitleChange={setHeaderTitle}
            />
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-600">
              <TabSystem 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                projects={projects}
              />
            </div>
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-600">
              <FilterBar 
                filterState={filterState}
                onFilterChange={setFilterState}
                activeTab={activeTab}
              />
            </div>

            <ProjectTable
              projects={projects}
              globalKRs={globalKRs}
              filterState={filterState}
              activeTab={activeTab}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
              onProjectReorder={handleProjectReorder}
              onGlobalKRChange={handleGlobalKRChange}
              onAddNewProject={addNewProject}
              showHoverRow={showHoverRow}
              hoverRowLocked={hoverRowLocked}
              onHoverRowLocked={setHoverRowLocked}
              onSortChange={(sortOption) => setFilterState({ ...filterState, sortBy: sortOption })}
            />

            {/* Empty state messages */}
            {getDisplayProjects().length === 0 && (
              <div className="px-6 py-8 text-center">
                <div className="text-slate-500 dark:text-slate-400">
                  {activeTab === 'future' && 'No projects planned for the future yet'}
                  {activeTab === 'not-started' && 'No projects labeled as not started'}
                  {activeTab === 'in-progress' && 'No projects in progress yet'}
                  {activeTab === 'on-hold' && 'No projects on hold yet'}
                  {activeTab === 'done' && 'No completed projects yet'}
                  {activeTab === 'all' && 'No projects yet'}
                </div>
              </div>
            )}

            {/* Hover row for adding new projects - only show in 'all' tab */}
            {activeTab === 'all' && showHoverRow && (
              <div className="px-6 py-2">
                <table className="w-full">
                  <tbody>
                    <tr 
                      className="border-b border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onMouseEnter={() => setShowHoverRow(true)}
                      onMouseLeave={() => {
                        if (!hoverRowLocked) {
                          setShowHoverRow(false);
                        }
                      }}
                      onMouseDown={() => addNewProject()}
                    >
                      <td className="pl-6 py-4 whitespace-nowrap w-20">
                        <div className="flex items-center">
                          <div className="w-4 h-4"></div>
                          <div 
                            className="text-slate-400 dark:text-slate-500 font-bold"
                            style={{ marginLeft: '30px', paddingLeft: '8px' }}
                          >
                            {projects.length + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <EditableCell
                          value=""
                          placeholder="Enter name to add project"
                          onChange={() => {}}
                          onBlur={() => {}}
                          onKeyDown={() => {}}
                          textSize="sm"
                          width="fill"
                        />
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap w-32"></td>
                      <td className="px-2 py-4 whitespace-nowrap w-28"></td>
                      <td className="px-2 py-4 whitespace-nowrap w-24"></td>
                      <td className="pr-6 py-4 whitespace-nowrap w-10"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Hover zone to trigger the new row - only row height */}
            {activeTab === 'all' && (
              <div 
                className="h-16 w-full"
                onMouseEnter={() => setShowHoverRow(true)}
                onMouseLeave={() => {
                  if (!hoverRowLocked) {
                    setShowHoverRow(false);
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}