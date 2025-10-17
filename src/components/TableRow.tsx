'use client';

import React from 'react';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import { EditableCell } from '@/components/EditableCell';
import { HyperlinkCell } from '@/components/HyperlinkCell';
import { PriorityDropdown } from '@/components/PriorityDropdown';
import { Pill } from '@/components/Pill';
import { OKRModal } from '@/components/OKRModal';
import { Badge } from '@/components/ui/badge';

interface TableRowProps {
  project: Project;
  projects: Project[];
  filterState: any;
  activeTab: string;
  expandedRows: Set<string>;
  draggedProjectId: string | null;
  insertAfterId: string | null;
  onProjectUpdate: (project: Project) => void;
  onPriorityUpdate: (projectId: string, newPriority: number) => void;
  onProjectDelete: (projectId: string) => void;
  onToggleRow: (projectId: string) => void;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent, projectId: string) => void;
  onDrop: (e: React.DragEvent) => void;
  onDeleteClick: (projectId: string) => void;
}

const getTextColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

const getPillVariant = (value: string, type: 'plan' | 'design' | 'build') => {
  if (type === 'plan') return 'no-fill';
  
  switch (value) {
    case 'Not started': return 'grey';
    case 'In progress': return 'grey'; // You can change this to a different variant if needed
    case 'On hold': return 'on-hold';
    case 'Done': return 'done';
    case 'Blocked': return 'blocked';
    case 'Future': return 'dark-grey';
    default: return 'grey';
  }
};

export function TableRow({
  project,
  projects,
  filterState,
  activeTab,
  expandedRows,
  draggedProjectId,
  insertAfterId,
  onProjectUpdate,
  onPriorityUpdate,
  onProjectDelete,
  onToggleRow,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  onDeleteClick
}: TableRowProps) {
  const isExpanded = expandedRows.has(project.id);
  const isDragging = draggedProjectId === project.id;

  return (
    <>
      {/* Drop zone above first row */}
      {insertAfterId === 'start' && draggedProjectId && (
        <tr>
          <td colSpan={filterState.showPlan ? 7 : 6} className="h-px bg-slate-200 dark:bg-slate-700"></td>
        </tr>
      )}
      
      <tr 
        className={`hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors ${
          isDragging ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
        }`}
        onDragOver={onDragOver}
        onDragEnter={(e) => onDragEnter(e, project.id)}
        onDrop={onDrop}
      >
        <td className="px-2 py-4 whitespace-nowrap">
          <PriorityDropdown
            currentPriority={project.priority}
            maxPriority={projects.length}
            onPriorityChange={(newPriority) => onPriorityUpdate(project.id, newPriority)}
            showDragHandle={filterState.sortBy.includes('priority')}
            onDragStart={(e) => onDragStart(e, project.id)}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isDragging={isDragging}
          />
        </td>
        
        <td className="px-4 py-4 whitespace-nowrap">
          <EditableCell
            value={project.name}
            onChange={(value) => onProjectUpdate({ ...project, name: value })}
            placeholder="Enter project name..."
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
        
        {filterState.showOKR && (
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-wrap">
                {project.okr.slice(0, 2).map((okr) => (
                  <Badge
                    key={okr.id}
                    className="text-xs"
                    style={{ 
                      backgroundColor: okr.color, 
                      color: getTextColor(okr.color)
                    }}
                  >
                    {okr.text}
                  </Badge>
                ))}
                {project.okr.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.okr.length - 2}
                  </Badge>
                )}
              </div>
              <OKRModal
                okrItems={project.okr}
                onOKRChange={(okrItems) => onProjectUpdate({ ...project, okr: okrItems })}
              >
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </OKRModal>
            </div>
          </td>
        )}
        
        {filterState.showPlan && (
          <td className="px-2 py-4 whitespace-nowrap">
            <Pill
              value={project.plan}
              onChange={(value) => onProjectUpdate({ ...project, plan: value as any })}
              type="plan"
              variant="no-fill"
            />
          </td>
        )}
        
        {activeTab === 'all' && (
          <td className="px-2 py-4 whitespace-nowrap">
            <Pill
              value={project.designStatus}
              onChange={(value) => onProjectUpdate({ ...project, designStatus: value as any })}
              type="design"
              variant={getPillVariant(project.designStatus, 'design')}
            />
          </td>
        )}
        
        <td className="px-2 py-4 whitespace-nowrap">
          <Pill
            value={project.buildStatus}
            onChange={(value) => onProjectUpdate({ ...project, buildStatus: value as any })}
            type="build"
            variant={getPillVariant(project.buildStatus, 'build')}
          />
        </td>
        
        <td className="pr-0 py-4 whitespace-nowrap">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 dark:text-slate-400"
            onClick={() => onToggleRow(project.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 rotate-180" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </td>
      </tr>
      
      {isExpanded && (
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
              onClick={() => onDeleteClick(project.id)}
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
    </>
  );
}
