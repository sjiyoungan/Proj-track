import { supabase } from './supabase';
import { Project, KRItem, FilterState } from '@/types/project';

// Projects
export async function saveProjects(projects: Project[]) {
  const { error } = await supabase
    .from('projects')
    .upsert(projects.map(project => ({
      id: project.id,
      priority: project.priority,
      name: project.name,
      plan: project.plan,
      initiative: project.initiative,
      selected_krs: project.selectedKRs,
      design_status: project.designStatus,
      build_status: project.buildStatus,
      problem_statement: project.problemStatement,
      solution: project.solution,
      success_metric: project.successMetric,
      figma_link: project.figmaLink,
      prd_link: project.prdLink,
      custom_links: project.customLinks,
      created_at: project.createdAt,
      updated_at: project.updatedAt
    })));
  
  if (error) throw error;
}

export async function loadProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('priority');
  
  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    priority: row.priority,
    name: row.name,
    plan: row.plan,
    initiative: row.initiative,
    selectedKRs: row.selected_krs || [],
    designStatus: row.design_status,
    buildStatus: row.build_status,
    problemStatement: row.problem_statement || '',
    solution: row.solution || '',
    successMetric: row.success_metric || '',
    figmaLink: row.figma_link || '',
    prdLink: row.prd_link || '',
    customLinks: row.custom_links || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

// Global KRs
export async function saveGlobalKRs(krs: KRItem[]) {
  const { error } = await supabase
    .from('global_krs')
    .upsert(krs.map(kr => ({
      id: kr.id,
      text: kr.text,
      fill_color: kr.fillColor,
      text_color: kr.textColor,
      order_index: kr.order
    })));
  
  if (error) throw error;
}

export async function loadGlobalKRs(): Promise<KRItem[]> {
  const { data, error } = await supabase
    .from('global_krs')
    .select('*')
    .order('order_index');
  
  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    text: row.text,
    fillColor: row.fill_color,
    textColor: row.text_color,
    order: row.order_index
  }));
}

// Filter State
export async function saveFilterState(filterState: FilterState) {
  const { error } = await supabase
    .from('filter_state')
    .upsert({
      id: 'default',
      show_initiative: filterState.showInitiative,
      show_kr: filterState.showKR,
      show_plan: filterState.showPlan,
      show_done: filterState.showDone,
      show_future: filterState.showFuture,
      sort_by: filterState.sortBy,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
}

export async function loadFilterState(): Promise<FilterState | null> {
  const { data, error } = await supabase
    .from('filter_state')
    .select('*')
    .eq('id', 'default')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  
  return {
    showInitiative: data.show_initiative,
    showKR: data.show_kr,
    showPlan: data.show_plan,
    showDone: data.show_done,
    showFuture: data.show_future,
    sortBy: data.sort_by
  };
}
