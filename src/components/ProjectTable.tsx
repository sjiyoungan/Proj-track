'use client';

import React, { useState } from 'react';
import { Project, FilterState, TabFilter, KRItem } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import { colors } from '@/lib/colors';
import { EditableCell } from '@/components/EditableCell';
import { HyperlinkCell } from '@/components/HyperlinkCell';
import { PriorityDropdown } from '@/components/PriorityDropdown';
import { PillDropdown } from '@/components/PillDropdown';
import { KRDropdown } from '@/components/KRDropdown';
import { SortableHeader } from '@/components/SortableHeader';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProjectTableProps {
  projects: Project[];
  filterState: FilterState;
  activeTab: TabFilter;
  onProjectUpdate: (project: Project) => void;
  onPriorityUpdate: (projectId: string, newPriority: number) => void;
  onSortChange: (sortOption: any) => void;
  onProjectDelete: (projectId: string) => void;
  globalKRs: KRItem[];
  onGlobalKRChange: (krs: KRItem[]) => void;
}

export function ProjectTable({ projects, filterState, activeTab, onProjectUpdate, onPriorityUpdate, onSortChange, onProjectDelete, globalKRs, onGlobalKRChange }: ProjectTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Helper function to find the previous project ID in the sorted list
  const findPreviousProjectId = (projectId: string) => {
    const currentIndex = sortedProjects.findIndex(p => p.id === projectId);
    if (currentIndex <= 0) {
      return 'start'; // Insert at the beginning
    }
    return sortedProjects[currentIndex - 1].id;
  };

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    switch (activeTab) {
      case 'in-progress':
        return project.designStatus === 'In progress' || project.buildStatus === 'In progress';
      case 'not-started':
        return project.designStatus === 'Not started' && project.buildStatus === 'Not started';
      case 'on-hold':
        return project.designStatus === 'On hold' || project.buildStatus === 'On hold';
      case 'done':
        return project.designStatus === 'Done' && project.buildStatus === 'Done';
      default:
        return true;
    }
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (filterState.sortBy) {
      case 'priority-asc':
        return a.priority - b.priority;
      case 'priority-desc':
        return b.priority - a.priority;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'plan-asc':
        return a.plan.localeCompare(b.plan);
      case 'plan-desc':
        return b.plan.localeCompare(a.plan);
      case 'okr-asc':
        return a.okr[0]?.text.localeCompare(b.okr[0]?.text || '') || 0;
      case 'okr-desc':
        return b.okr[0]?.text.localeCompare(a.okr[0]?.text || '') || 0;
      case 'buildStatus-asc':
        return a.buildStatus.localeCompare(b.buildStatus);
      case 'buildStatus-desc':
        return b.buildStatus.localeCompare(a.buildStatus);
      default:
        return a.priority - b.priority;
    }
  });

  const toggleRow = (projectId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getTextColor = (backgroundColor: string) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't change if we're dragging over the same project
    if (draggedProjectId === projectId) {
      return;
    }
    
    // Simply insert after this project - no complex positioning
    setInsertAfterId(projectId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (!draggedId || !insertAfterId) {
      setDraggedProjectId(null);
      setInsertAfterId(null);
      return;
    }

    // Create a new array with the dragged item in the correct position
    const projectsCopy = [...projects];
    const draggedProject = projectsCopy.find(p => p.id === draggedId);
    
    if (!draggedProject) {
      setDraggedProjectId(null);
      setInsertAfterId(null);
      return;
    }

    // Remove the dragged project from its current position
    const filteredProjects = projectsCopy.filter(p => p.id !== draggedId);
    
    // Find where to insert the dragged project
    let insertIndex: number;
    if (insertAfterId === 'start') {
      insertIndex = 0;
    } else {
      insertIndex = filteredProjects.findIndex(p => p.id === insertAfterId) + 1;
    }
    
    // Insert the dragged project at the new position
    filteredProjects.splice(insertIndex, 0, draggedProject);
    
    // Update all priorities to match the new order
    filteredProjects.forEach((project, index) => {
      const newPriority = index + 1;
      if (project.priority !== newPriority) {
        onPriorityUpdate(project.id, newPriority);
      }
    });
    
    setDraggedProjectId(null);
    setInsertAfterId(null);
  };

  // Delete handlers
  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onProjectDelete(projectToDelete);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleKRSelect = (projectId: string, krId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const currentSelectedKRs = Array.isArray(project.selectedKRs) ? project.selectedKRs : [];
      const updatedProject = {
        ...project,
        selectedKRs: [...currentSelectedKRs, krId]
      };
      onProjectUpdate(updatedProject);
    }
  };

  const handleKRRemove = (projectId: string, krId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const currentSelectedKRs = Array.isArray(project.selectedKRs) ? project.selectedKRs : [];
      const updatedProject = {
        ...project,
        selectedKRs: currentSelectedKRs.filter(id => id !== krId)
      };
      onProjectUpdate(updatedProject);
    }
  };

  // Simple display - just show the sorted projects as they are
  const getDisplayProjects = () => {
    return sortedProjects;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-600">
      <table className="w-full table-auto">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr className="border-b border-slate-100 dark:border-slate-600">
            <SortableHeader sortKey="priority" currentSort={filterState.sortBy} onSortChange={onSortChange} className="w-20">
              Priority
            </SortableHeader>
            <SortableHeader sortKey="name" currentSort={filterState.sortBy} onSortChange={onSortChange} className="w-48" style={{ paddingLeft: '9px' }}>
              Name
            </SortableHeader>
            {filterState.showInitiative && (
              <th className="px-4 py-3 pl-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48">
                Initiative
              </th>
            )}
            {filterState.showKR && (
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">
                KR
              </th>
            )}
            {filterState.showPlan && (
              <SortableHeader sortKey="plan" currentSort={filterState.sortBy} onSortChange={onSortChange} className="w-32" style={{ paddingLeft: '8px' }}>
                Plan
              </SortableHeader>
            )}
            {activeTab === 'all' && (
              <SortableHeader sortKey="designStatus" currentSort={filterState.sortBy} onSortChange={onSortChange} className="w-28">
                Design Status
              </SortableHeader>
            )}
            <SortableHeader sortKey="buildStatus" currentSort={filterState.sortBy} onSortChange={onSortChange} className="w-28">
              Build Status
            </SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {getDisplayProjects().length === 0 ? (
            <tr>
              <td 
                colSpan={filterState.showPlan ? 8 : 7} 
                className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-lg font-medium">No projects yet</div>
                  <div className="text-sm">Click "Add Project" to get started</div>
                </div>
              </td>
            </tr>
          ) : (
            getDisplayProjects().map((project, index) => (
            <React.Fragment key={project.id}>
              {/* Drop zone above first row */}
              {index === 0 && insertAfterId === 'start' && draggedProjectId && (
                <tr>
                  <td colSpan={filterState.showPlan ? 7 : 6} className="h-px bg-slate-200 dark:bg-slate-700"></td>
                </tr>
              )}
              <tr 
                className={`hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors ${
                  draggedProjectId === project.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
                }`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, project.id)}
                onDrop={handleDrop}
              >
                <td className="px-2 py-4 whitespace-nowrap">
                  <PriorityDropdown
                    currentPriority={project.priority}
                    maxPriority={projects.length}
                    onPriorityChange={(newPriority) => onPriorityUpdate(project.id, newPriority)}
                    showDragHandle={true}
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragging={draggedProjectId === project.id}
                  />
                </td>
                <td className="pl-0 pr-4 py-4 whitespace-nowrap">
                  <EditableCell
                    value={project.name}
                    onChange={(value) => onProjectUpdate({ ...project, name: value })}
                    placeholder="Enter project"
                  />
                </td>
                {filterState.showInitiative && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <EditableCell
                      value={project.initiative}
                      onChange={(value) => onProjectUpdate({ ...project, initiative: value })}
                      placeholder="Enter initiative..."
                    />
                  </td>
                )}
                {filterState.showKR && (
                  <td className="px-2 py-4 whitespace-nowrap">
                    <KRDropdown
                      globalKRs={globalKRs}
                      selectedKRIds={Array.isArray(project.selectedKRs) ? project.selectedKRs : []}
                      onKRSelect={(krId) => handleKRSelect(project.id, krId)}
                      onKRRemove={(krId) => handleKRRemove(project.id, krId)}
                      onGlobalKRChange={onGlobalKRChange}
                    />
                  </td>
                )}
                {filterState.showPlan && (
                  <td className="pl-0 pr-2 py-4 whitespace-nowrap">
                    <PillDropdown
                      value={project.plan}
                      onChange={(value) => onProjectUpdate({ ...project, plan: value as any })}
                      type="plan"
                      variant="text-only"
                    />
                  </td>
                )}
                {activeTab === 'all' && (
                  <td className="px-2 py-4 whitespace-nowrap">
                    <PillDropdown
                      value={project.designStatus}
                      onChange={(value) => onProjectUpdate({ ...project, designStatus: value as any })}
                      type="design"
                      variant="filled"
                    />
                  </td>
                )}
                <td className="px-2 py-4 whitespace-nowrap">
                  <PillDropdown
                    value={project.buildStatus}
                    onChange={(value) => onProjectUpdate({ ...project, buildStatus: value as any })}
                    type="build"
                    variant="filled"
                  />
                </td>
                <td className="pr-0 py-4 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 dark:text-slate-400"
                    onClick={() => toggleRow(project.id)}
                  >
                    {expandedRows.has(project.id) ? (
                      <ChevronDown className="h-4 w-4 rotate-180" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
              {expandedRows.has(project.id) && (
                <tr>
                  <td colSpan={[filterState.showPlan, filterState.showInitiative, filterState.showOKR].filter(Boolean).length + (activeTab === 'all' ? 5 : 4)} className="px-4 py-4 bg-slate-50 dark:bg-slate-800 relative">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Problem Statement</h4>
                        <HyperlinkCell
                          value={project.problemStatement}
                          onChange={(value) => onProjectUpdate({ ...project, problemStatement: value })}
                          placeholder="Describe the problem..."
                          multiline={true}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Solution</h4>
                        <HyperlinkCell
                          value={project.solution}
                          onChange={(value) => onProjectUpdate({ ...project, solution: value })}
                          placeholder="Describe the solution..."
                          multiline={true}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Success Metric</h4>
                        <HyperlinkCell
                          value={project.successMetric}
                          onChange={(value) => onProjectUpdate({ ...project, successMetric: value })}
                          placeholder="Define success metrics..."
                          multiline={true}
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.figmaLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Figma
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.prdLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            PRD
                          </a>
                        </Button>
                      </div>
                    </div>
                    {/* Delete button in bottom right corner */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-4 right-4 opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteClick(project.id)}
                    >
                      <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </td>
                </tr>
              )}
              {/* Drop zone after each row */}
              {insertAfterId === project.id && draggedProjectId && (
                <tr>
                  <td colSpan={filterState.showPlan ? 7 : 6} className="h-px bg-slate-200 dark:bg-slate-700"></td>
                </tr>
              )}
            </React.Fragment>
            ))
          )}
        </tbody>
      </table>
      
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Custom overlay */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur"
            onClick={handleDeleteCancel}
          />
          {/* Dialog content */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg w-fit mx-4">
            <div className="pt-6 px-6 pb-4">
              <p className="text-slate-900 dark:text-slate-100 mb-8">Do you want to delete this project?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleDeleteCancel}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
