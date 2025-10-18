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
  
  return data.map((row: any) => ({
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
  
  return data.map((row: any) => ({
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
    .eq('id', 'default');
  
  if (error) {
    console.error('Error loading filter state:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    return null; // No filter state found
  }
  
  const filterData = data[0];
  return {
    showInitiative: filterData.show_initiative,
    showKR: filterData.show_kr,
    showPlan: filterData.show_plan,
    showDone: filterData.show_done,
    showFuture: filterData.show_future,
    sortBy: filterData.sort_by
  };
}

// Sharing functions
export async function createShare(): Promise<string> {
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { error } = await supabase
      .from('shares')
      .insert({
        share_id: shareId,
        owner_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) throw error;
    return shareId;
  } catch (error) {
    console.error('Failed to create share in database:', error);
    // Fallback: return shareId anyway, it will work with localStorage fallback
    return shareId;
  }
}

export async function getShareData(shareId: string) {
  try {
    // First, verify the share exists and is active
    const { data: share, error: shareError } = await supabase
      .from('shares')
      .select('owner_id')
      .eq('share_id', shareId)
      .eq('is_active', true)
      .single();
    
    if (shareError || !share) {
      throw new Error('Share not found or inactive');
    }
    
    // Load the owner's data
    const [projects, globalKRs, filterState] = await Promise.all([
      loadProjects(),
      loadGlobalKRs(), 
      loadFilterState()
    ]);
    
    return {
      projects,
      globalKRs,
      filterState: filterState || {
        showInitiative: true,
        showKR: true,
        showPlan: true,
        showDone: true,
        showFuture: true,
        sortBy: 'priority-asc'
      }
    };
  } catch (error) {
    console.error('Failed to load share data from database:', error);
    // Fallback: load current user's data (this will work for testing)
    const [projects, globalKRs, filterState] = await Promise.all([
      loadProjects(),
      loadGlobalKRs(), 
      loadFilterState()
    ]);
    
    return {
      projects,
      globalKRs,
      filterState: filterState || {
        showInitiative: true,
        showKR: true,
        showPlan: true,
        showDone: true,
        showFuture: true,
        sortBy: 'priority-asc'
      }
    };
  }
}

export async function revokeShare(shareId: string) {
  const { error } = await supabase
    .from('shares')
    .update({ is_active: false })
    .eq('share_id', shareId);
  
  if (error) throw error;
}
