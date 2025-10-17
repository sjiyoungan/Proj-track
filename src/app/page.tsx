'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { EditableHeader } from '@/components/EditableHeader';
import { Project, FilterState, TabFilter, KRItem } from '@/types/project';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    priority: 1,
    name: 'User Authentication System',
    plan: 'Prime',
    initiative: 'Core Platform',
    selectedKRs: ['okr1', 'okr2'],
    designStatus: 'Done',
    buildStatus: 'In progress',
    problemStatement: 'Users need secure authentication to access the platform',
    solution: 'Implement OAuth 2.0 with 2FA support using industry standards',
    successMetric: '95% user login success rate within 3 seconds',
    figmaLink: 'https://figma.com/design/123',
    prdLink: 'https://docs.google.com/prd/123',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    priority: 2,
    name: 'Dashboard Analytics',
    plan: 'Free',
    initiative: 'Analytics',
    selectedKRs: ['okr3'],
    designStatus: 'In progress',
    buildStatus: 'Not started',
    problemStatement: 'Users need insights into their data usage',
    solution: 'Build interactive dashboard with real-time analytics',
    successMetric: '80% of users check dashboard weekly',
    figmaLink: 'https://figma.com/design/456',
    prdLink: 'https://docs.google.com/prd/456',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    priority: 3,
    name: 'Mobile App Redesign',
    plan: 'Pre-account',
    initiative: 'Mobile Experience',
    selectedKRs: ['okr4', 'okr5'],
    designStatus: 'Not started',
    buildStatus: 'Not started',
    problemStatement: 'Current mobile app has poor UX',
    solution: 'Complete redesign with modern UI patterns',
    successMetric: 'Increase mobile app rating to 4.5+ stars',
    figmaLink: 'https://figma.com/design/789',
    prdLink: 'https://docs.google.com/prd/789',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '4',
    priority: 4,
    name: 'Email Notification System',
    plan: 'Prime',
    initiative: 'Communication',
    selectedKRs: ['okr6', 'okr7'],
    designStatus: 'In progress',
    buildStatus: 'On hold',
    problemStatement: 'Users are not receiving important notifications',
    solution: 'Build robust email system with delivery tracking',
    successMetric: '99% email delivery rate within 5 minutes',
    figmaLink: 'https://figma.com/design/101',
    prdLink: 'https://docs.google.com/prd/101',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '5',
    priority: 5,
    name: 'API Rate Limiting',
    plan: 'Free',
    initiative: 'Infrastructure',
    selectedKRs: ['okr8', 'okr9'],
    designStatus: 'Done',
    buildStatus: 'Not started',
    problemStatement: 'API is being abused causing performance issues',
    solution: 'Implement intelligent rate limiting with usage monitoring',
    successMetric: 'Reduce API abuse by 90% while maintaining 99.9% uptime',
    figmaLink: 'https://figma.com/design/102',
    prdLink: 'https://docs.google.com/prd/102',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '6',
    priority: 6,
    name: 'User Onboarding Flow',
    plan: 'Prime',
    initiative: 'User Experience',
    selectedKRs: ['okr10', 'okr11'],
    designStatus: 'Not started',
    buildStatus: 'Not started',
    problemStatement: 'New users struggle to understand the platform',
    solution: 'Create guided onboarding with interactive tutorials',
    successMetric: 'Increase user activation rate to 70% within first week',
    figmaLink: 'https://figma.com/design/103',
    prdLink: 'https://docs.google.com/prd/103',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: '7',
    priority: 7,
    name: 'Data Export Feature',
    plan: 'Free',
    initiative: 'Data Management',
    selectedKRs: ['okr12', 'okr13', 'okr14'],
    designStatus: 'In progress',
    buildStatus: 'In progress',
    problemStatement: 'Users need to export their data for analysis',
    solution: 'Build comprehensive export system with multiple formats',
    successMetric: 'Enable users to export 100% of their data within 30 seconds',
    figmaLink: 'https://figma.com/design/104',
    prdLink: 'https://docs.google.com/prd/104',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-30')
  }
];

// Mock global KRs data
const mockGlobalKRs: KRItem[] = [
  { id: 'okr1', text: 'Implement OAuth 2.0', color: '#3B82F6', order: 0 },
  { id: 'okr2', text: 'Add 2FA support', color: '#10B981', order: 1 },
  { id: 'okr3', text: 'Real-time metrics', color: '#F59E0B', order: 2 },
  { id: 'okr4', text: 'iOS redesign', color: '#8B5CF6', order: 3 },
  { id: 'okr5', text: 'Android redesign', color: '#EF4444', order: 4 },
  { id: 'okr6', text: 'Transactional emails', color: '#06B6D4', order: 5 },
  { id: 'okr7', text: 'Marketing campaigns', color: '#84CC16', order: 6 },
  { id: 'okr8', text: 'Implement rate limits', color: '#F97316', order: 7 },
  { id: 'okr9', text: 'Monitor usage patterns', color: '#EC4899', order: 8 },
  { id: 'okr10', text: 'Interactive tutorial', color: '#10B981', order: 9 },
  { id: 'okr11', text: 'Progress tracking', color: '#8B5CF6', order: 10 },
  { id: 'okr12', text: 'CSV export', color: '#F59E0B', order: 11 },
  { id: 'okr13', text: 'PDF reports', color: '#EF4444', order: 12 },
  { id: 'okr14', text: 'Scheduled exports', color: '#06B6D4', order: 13 }
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [globalKRs, setGlobalKRs] = useState<KRItem[]>(mockGlobalKRs);
  const [filterState, setFilterState] = useState<FilterState>({
    showInitiative: true,
    showKR: true,
    showPlan: true,
    sortBy: 'priority-asc'
  });
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [headerTitle, setHeaderTitle] = useState<string>('');

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
      console.log('💾 Saved to localStorage');
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedTitle = localStorage.getItem('headerTitle');
    const savedGlobalKRs = localStorage.getItem('globalKRs');
    
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed.map((p: any) => ({
          ...p,
          selectedKRs: Array.isArray(p.selectedKRs) ? p.selectedKRs : [],
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        })));
        console.log('📂 Loaded projects from localStorage');
      } catch (error) {
        console.error('❌ Failed to load projects:', error);
      }
    }
    
    if (savedTitle) {
      setHeaderTitle(savedTitle);
      console.log('📂 Loaded header title from localStorage');
    }

    if (savedGlobalKRs) {
      try {
        const parsed = JSON.parse(savedGlobalKRs);
        setGlobalKRs(parsed);
        console.log('📂 Loaded global KRs from localStorage');
      } catch (error) {
        console.error('❌ Failed to load global KRs:', error);
      }
    }
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    saveToLocalStorage();
  }, [projects, headerTitle, globalKRs]);

  const handleProjectUpdate = (updatedProject: Project) => {
    console.log('📝 Project update triggered:', updatedProject.id, updatedProject.name);
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id 
        ? { ...updatedProject, updatedAt: new Date() }
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
      id: `project-${Date.now()}`,
      priority: projects.length + 1,
      name: '',
      plan: 'Free',
      initiative: '',
      selectedKRs: [],
      designStatus: 'Not started',
      buildStatus: 'Not started',
      problemStatement: '',
      solution: '',
      successMetric: '',
      figmaLink: '',
      prdLink: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setProjects(prev => [...prev, newProject]);
  };

  const clearAllData = () => {
    localStorage.removeItem('projects');
    localStorage.removeItem('headerTitle');
    localStorage.removeItem('globalKRs');
    setProjects([]);
    setHeaderTitle('');
    setGlobalKRs([]);
    console.log('🗑️ Cleared all data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EditableHeader
          title={headerTitle}
          onTitleChange={handleHeaderTitleChange}
        />

        {/* Tab System and Filter Bar */}
        <div className="flex justify-between items-center mb-6">
          <TabSystem 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
          <FilterBar
            filterState={filterState}
            onFilterChange={setFilterState}
            activeTab={activeTab}
          />
        </div>

        {/* Project Table */}
        <Card>
          <CardContent className="p-0">
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
            />
          </CardContent>
        </Card>

        {/* Add Project Button */}
        <div className="mt-6 flex justify-center">
          <Button onClick={addNewProject} className="px-8 py-3">
            Add Project
          </Button>
        </div>

        {/* Debug: Clear All Data Button (temporary) */}
        <div className="mt-4 flex justify-center">
          <Button onClick={clearAllData} variant="outline" className="text-sm">
            Clear All Data (Reset)
          </Button>
        </div>
      </div>
    </div>
  );
}