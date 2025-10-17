export interface OKRItem {
  id: string;
  text: string;
  color: string;
  order: number;
}

export interface Project {
  id: string;
  priority: number;
  name: string;
  plan: 'Prime' | 'Free' | 'Pre-account';
  initiative: string;
  okr: OKRItem[];
  designStatus: 'Not started' | 'In progress' | 'On hold' | 'Done' | 'Future';
  buildStatus: 'Not started' | 'In progress' | 'On hold' | 'Done' | 'Future';
  problemStatement: string;
  solution: string;
  successMetric: string;
  figmaLink: string;
  prdLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SortOption = 
  | 'priority-asc' | 'priority-desc'
  | 'name-asc' | 'name-desc'
  | 'plan-asc' | 'plan-desc'
  | 'okr-asc' | 'okr-desc'
  | 'buildStatus-asc' | 'buildStatus-desc';

export interface FilterState {
  showInitiative: boolean;
  showOKR: boolean;
  showPlan: boolean;
  sortBy: SortOption;
}

export type TabFilter = 'all' | 'in-progress' | 'not-started' | 'on-hold' | 'done';
