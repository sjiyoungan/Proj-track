'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { BoardName } from '@/components/TrackerName';
import { EditableCell } from '@/components/EditableCell';
import { AuthForm } from '@/components/AuthForm';
import { Project, FilterState, TabFilter, KRItem, SortOption } from '@/types/project';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from '@/contexts/AuthContext';
import { saveBoard, loadBoard, getShareData, getUserBoards, loadBoardById, saveBoardById } from '@/lib/supabaseService';

interface BoardPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const [userId, setUserId] = useState<string>('');
  const [userIdLoaded, setUserIdLoaded] = useState<boolean>(false);
  const [currentBoardId, setCurrentBoardId] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareBoardId, setShareBoardId] = useState<string>('');
  const [currentAccessLevel, setCurrentAccessLevel] = useState<string>('edit');
  
  useEffect(() => {
    params.then(({ userId }) => {
      console.log('🔗 Extracted userId from params:', userId);
      setUserId(userId);
      setUserIdLoaded(true);
    });
  }, [params]);
  const mounted = useMounted();
  const { user, loading: authLoading } = useAuth();
  
  console.log('🏠 Board component rendered:', { mounted, user: !!user, authLoading, urlUserId: userId });
  
  // Initialize current board ID when user loads
  useEffect(() => {
    if (mounted && user && userIdLoaded && !currentBoardId) {
      // For now, we'll use the user's ID as the board ID
      // Later we'll implement proper board selection
      setCurrentBoardId(user.id);
    }
  }, [mounted, user, userIdLoaded, currentBoardId]);

  // Handle board switching
  const handleBoardChange = async (boardId: string, accessLevel: string) => {
    console.log('🔄 Switching boards:', { from: currentBoardId, to: boardId });
    
    // Set flag to prevent auto-save during switch
    setIsSwitchingBoards(true);
    
    // Save current board data before switching
    if (currentBoardId && currentBoardId !== boardId) {
      console.log('💾 Saving current board data before switching...');
      try {
        await saveToSupabase();
        console.log('✅ Current board data saved successfully');
      } catch (error) {
        console.error('❌ Error saving current board data:', error);
      }
    }
    
    setCurrentBoardId(boardId);
    setCurrentAccessLevel(accessLevel);
    // Reload data for the new board
    await loadBoardData(boardId);
    
    // Re-enable auto-save after a short delay
    setTimeout(() => {
      setIsSwitchingBoards(false);
    }, 1000);
  };


  // Load board data by ID
  const loadBoardData = async (boardId: string) => {
    try {
      // Try to load from the new boards table first
      const boardData = await loadBoardById(boardId);
      setProjects(boardData.projects);
      setGlobalKRs(boardData.globalKRs);
      setFilterState(boardData.filterState);
      setBoardName(boardData.boardName);
    } catch (error) {
      console.error('❌ Failed to load tracker data from new system:', error);
      // Fall back to the old system if new system isn't set up yet
      try {
        const oldTrackerData = await loadTracker();
        setProjects(oldTrackerData.projects);
        setGlobalKRs(oldTrackerData.globalKRs);
        setFilterState(oldTrackerData.filterState);
        setBoardName(oldTrackerData.boardName);
      } catch (fallbackError) {
        console.error('❌ Failed to load tracker data from old system:', fallbackError);
        // Create empty project if both fail
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
    }
  };
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
  const [boardName, setBoardName] = useState<string>('');
  const [showHoverRow, setShowHoverRow] = useState(false);
  const [hoverRowLocked, setHoverRowLocked] = useState(false);

  const handleTrackerNameChange = (newName: string) => {
    console.log('🔄 Tracker name changing from:', boardName, 'to:', newName);
    setBoardName(newName);
  };

  const handleGlobalKRChange = (newKRs: KRItem[]) => {
    setGlobalKRs(newKRs);
  };

  // Save to Supabase
  const saveToSupabase = async () => {
    try {
      console.log('💾 Saving to Supabase with boardName:', boardName);
      await saveBoardById(currentBoardId, {
        projects,
        globalKRs,
        filterState,
        boardName
      });
      console.log('✅ Save completed successfully');
    } catch (error) {
      console.error('❌ Save failed with new system:', error);
      // Fall back to the old system if new system isn't set up yet
      try {
        await saveTracker({
          projects,
          globalKRs,
          filterState,
          boardName
        });
        console.log('✅ Save completed successfully with old system');
      } catch (fallbackError) {
        console.error('❌ Save failed with old system:', fallbackError);
      }
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { mounted, authLoading, userIdLoaded, hasUser: !!user, userId });
    if (!mounted || authLoading || !userIdLoaded || !user || !userId) {
      console.log('❌ Not ready for data load:', { mounted, authLoading, userIdLoaded, hasUser: !!user, userId });
      return;
    }
    
    const loadData = async () => {
      console.log('🔄 Starting to load data...');
      try {
        // Check if we're in share mode
        const shareParam = new URLSearchParams(window.location.search).get('share');
        
        if (shareParam && shareParam.startsWith('share-')) {
          console.log('📤 Loading shared data...');
          // Load shared data from Supabase
          const sharedData = await getShareData(shareParam);
          setProjects(sharedData.projects);
          setGlobalKRs(sharedData.globalKRs);
          setFilterState(sharedData.filterState);
          
          // If no shared projects exist, create empty project
          if (sharedData.projects.length === 0) {
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

        console.log('📥 Loading tracker data...');
        try {
          const trackerData = await loadBoardById(currentBoardId);
          
          console.log('📊 Loaded data:', {
            projects: trackerData.projects.length,
            krs: trackerData.globalKRs.length,
            hasFilterState: !!trackerData.filterState,
            boardName: trackerData.boardName
          });
          
          setProjects(trackerData.projects);
          setGlobalKRs(trackerData.globalKRs);
          setFilterState(trackerData.filterState);
          setBoardName(trackerData.boardName);
          setHasLoadedData(true); // Mark that we've loaded data
          
          // If no projects exist, create an empty one automatically
          if (trackerData.projects.length === 0) {
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
          console.error('❌ Failed to load tracker data from new system:', error);
          // Fall back to the old system if new system isn't set up yet
          try {
            const oldTrackerData = await loadTracker();
            
            console.log('📊 Loaded data from old system:', {
              projects: oldTrackerData.projects.length,
              krs: oldTrackerData.globalKRs.length,
              hasFilterState: !!oldTrackerData.filterState,
              boardName: oldTrackerData.boardName
            });
            
            setProjects(oldTrackerData.projects);
            setGlobalKRs(oldTrackerData.globalKRs);
            setFilterState(oldTrackerData.filterState);
            setBoardName(oldTrackerData.boardName);
            setHasLoadedData(true); // Mark that we've loaded data
            
            // If no projects exist, create an empty one automatically
            if (oldTrackerData.projects.length === 0) {
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
          } catch (fallbackError) {
            console.error('❌ Failed to load tracker data from old system:', fallbackError);
            // Create empty project if both fail
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
            setHasLoadedData(true);
          }
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
  }, [mounted, user, authLoading, userIdLoaded, userId, currentBoardId]);
  
  // Debug user state
  useEffect(() => {
    console.log('👤 User state changed:', { user: !!user, userId: user?.id, email: user?.email });
  }, [user]);

  // Auto-save when data changes (but not on initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [isSwitchingBoards, setIsSwitchingBoards] = useState(false);
  
  useEffect(() => {
    if (!mounted || !user || !userIdLoaded || !userId) return;
    
    // Skip auto-save on initial load or if we haven't loaded data yet
    if (isInitialLoad || !hasLoadedData || isSwitchingBoards) {
      if (hasLoadedData && !isSwitchingBoards) {
        setIsInitialLoad(false);
      }
      return;
    }
    
    console.log('💾 Auto-save triggered, boardName:', boardName);
    saveToSupabase();
  }, [projects, boardName, globalKRs, filterState, mounted, user, userIdLoaded, userId, hasLoadedData, currentBoardId, isSwitchingBoards]);

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
      await saveTracker({
        projects: [],
        globalKRs: [],
        filterState: {
          showInitiative: true,
          showKR: true,
          showPlan: true,
          showDone: true,
          showFuture: true,
          sortBy: 'priority-asc'
        },
        boardName: ''
      });
      
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
      setBoardName('');
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
      const trackerData = await loadTracker();
      await saveTracker({
        ...trackerData,
        globalKRs: []
      });
      setGlobalKRs([]);
    } catch (error) {
      console.error('❌ Failed to reset KR data:', error);
    }
  };

  const getDisplayProjects = () => {
    return projects.filter(project => {
      // Apply tab filter
      let passesTabFilter = true;
      if (activeTab === 'in-progress') {
        passesTabFilter = project.designStatus === 'In progress' || project.buildStatus === 'In progress';
      } else if (activeTab === 'on-hold') {
        passesTabFilter = project.designStatus === 'On hold' || project.buildStatus === 'On hold';
      } else if (activeTab === 'done') {
        passesTabFilter = project.designStatus === 'Done' && project.buildStatus === 'Done';
      } else if (activeTab === 'future') {
        passesTabFilter = project.designStatus === 'Future';
      } else if (activeTab === 'not-started') {
        passesTabFilter = project.designStatus === 'Not started' && project.buildStatus === 'Not started';
      }

      // Apply other filters
      const passesInitiativeFilter = !filterState.showInitiative || project.initiative;
      const passesKRFilter = !filterState.showKR || project.selectedKRs.length > 0;
      const passesPlanFilter = !filterState.showPlan || project.plan !== 'select';
      const passesDoneFilter = filterState.showDone || (project.designStatus !== 'Done' && project.buildStatus !== 'Done');
      const passesFutureFilter = filterState.showFuture || project.designStatus !== 'Future';

      return passesTabFilter && passesInitiativeFilter && passesKRFilter && 
             passesPlanFilter && passesDoneFilter && passesFutureFilter;
    });
  };

  if (!mounted || !userIdLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 w-fit">
            <div className="animate-pulse">
              <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
  const shareParam = new URLSearchParams(window.location.search).get('share');
  if (!user && !(shareParam && shareParam.startsWith('share-'))) {
    return <AuthForm />;
  }
  
  // If in share mode but no user, show auth form with message
  if (shareParam && shareParam.startsWith('share-') && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Sign in to collaborate
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            You need to sign in to view and edit this shared project.
          </p>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <TrackerName
                  boardName={boardName}
                  onTrackerNameChange={handleTrackerNameChange}
                  currentBoardId={currentBoardId}
                  onTrackerChange={handleTrackerChange}
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
              onSortChange={(sortOption: SortOption) => setFilterState({ ...filterState, sortBy: sortOption })}
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
}