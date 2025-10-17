'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectTable } from '@/components/ProjectTable';
import { FilterBar } from '@/components/FilterBar';
import { TabSystem } from '@/components/TabSystem';
import { Project, FilterState, TabFilter } from '@/types/project';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    priority: 1,
    name: 'User Authentication System',
    plan: 'Prime',
    initiative: 'Core Platform',
    okr: [
      { id: 'okr1', text: 'Implement OAuth 2.0', color: '#3B82F6', order: 0 },
      { id: 'okr2', text: 'Add 2FA support', color: '#10B981', order: 1 }
    ],
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
    okr: [
      { id: 'okr3', text: 'Real-time metrics', color: '#F59E0B', order: 0 }
    ],
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
    okr: [
      { id: 'okr4', text: 'iOS redesign', color: '#8B5CF6', order: 0 },
      { id: 'okr5', text: 'Android redesign', color: '#EF4444', order: 1 }
    ],
    designStatus: 'Not started',
    buildStatus: 'Not started',
    problemStatement: 'Current mobile app has poor UX',
    solution: 'Complete redesign with modern UI patterns',
    successMetric: 'Increase mobile app rating to 4.5+ stars',
    figmaLink: 'https://figma.com/design/789',
    prdLink: 'https://docs.google.com/prd/789',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12')
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [filterState, setFilterState] = useState<FilterState>({
    showInitiative: true,
    showOKR: true,
    showPlan: true,
    sortBy: 'priority-asc'
  });
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      localStorage.setItem('projects', JSON.stringify(projects));
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [projects]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    }
  }, []);

  const handleProjectUpdate = (updatedProject: Project) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
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
        <Card>
          <CardContent className="p-0">
            <ProjectTable
              projects={projects}
              filterState={filterState}
              activeTab={activeTab}
              onProjectUpdate={handleProjectUpdate}
              onPriorityUpdate={handlePriorityUpdate}
              onSortChange={setFilterState}
              onProjectDelete={handleProjectDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
