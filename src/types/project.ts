export interface KRItem {
  id: string;
  text: string;
  fillColor: string;
  textColor: string;
  order: number;
}

export interface Project {
  id: string;
  priority: number;
  name: string;
  plan: 'Prime' | 'Free' | 'Pre-account';
  initiative: string;
  selectedKRs: string[];
  designStatus: 'Not started' | 'In progress' | 'On hold' | 'Done' | 'Future';
  buildStatus: 'Not started' | 'In progress' | 'On hold' | 'Done' | 'Future';
  problemStatement: string;
  solution: string;
  successMetric: string;
  figmaLink: string;
  prdLink: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type SortOption = 
  | 'priority-asc' | 'priority-desc'
  | 'name-asc' | 'name-desc'
  | 'plan-asc' | 'plan-desc'
  | 'kr-asc' | 'kr-desc'
  | 'buildStatus-asc' | 'buildStatus-desc';

export interface FilterState {
  showInitiative: boolean;
  showKR: boolean;
  showPlan: boolean;
  showDone: boolean;
  showFuture: boolean;
  sortBy: SortOption;
}

export type TabFilter = 'all' | 'in-progress' | 'not-started' | 'on-hold' | 'done' | 'future';
