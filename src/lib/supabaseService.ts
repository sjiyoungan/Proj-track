import { supabase } from './supabase';
import { Project, KRItem, FilterState } from '@/types/project';

// New unified tracker service functions using the trackers table

export async function saveTracker(data: {
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  trackerName: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('💾 Saving tracker data:', {
    user_id: user.id,
    projects_count: data.projects.length,
    globalKRs_count: data.globalKRs.length,
    trackerName: data.trackerName,
    filterState: data.filterState
  });
  
  if (!user) {
    console.log('❌ No user found for saving tracker');
    throw new Error('User not authenticated');
  }

  const upsertData = {
    user_id: user.id,
    projects: data.projects,
    global_krs: data.globalKRs,
    filter_state: data.filterState,
    tracker_name: data.trackerName,
    updated_at: new Date().toISOString()
  };
  
  console.log('🔍 Upsert data being sent:', upsertData);
  
  const { error } = await supabase
    .from('trackers')
    .upsert(upsertData, { onConflict: 'user_id' });
  
  if (error) {
    console.error('❌ Error saving tracker:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  console.log('✅ Tracker saved successfully for user:', user.id);
}

export async function loadTracker(): Promise<{
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  trackerName: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('🔍 Loading tracker for user:', user?.id, user?.email);
  
  if (!user) {
    console.log('❌ No user found, returning empty data');
    return {
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
      trackerName: ''
    };
  }

  console.log('🔍 Loading tracker data for user:', user?.id, user?.email);
  
  const { data, error } = await supabase
    .from('trackers')
    .select('projects, global_krs, filter_state, tracker_name')
    .eq('user_id', user.id)
    .single();
  
  console.log('🔍 Database response:', { data, error });
  console.log('🔍 Raw tracker_name value:', data?.tracker_name);
  
  if (error) {
    console.error('❌ Error loading tracker:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    // Return empty data if no tracker exists yet
    return {
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
      trackerName: ''
    };
  }
  
  console.log('✅ Tracker loaded successfully for user:', user.id);
  
  return {
    projects: data.projects || [],
    globalKRs: data.global_krs || [],
    filterState: data.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority'
    },
    trackerName: data.tracker_name || ''
  };
}

// Individual save functions for specific data types
export async function saveProjects(projects: Project[]) {
  const trackerData = await loadTracker();
  await saveTracker({
    ...trackerData,
    projects
  });
}

export async function loadProjects(): Promise<Project[]> {
  const trackerData = await loadTracker();
  return trackerData.projects;
}

export async function saveGlobalKRs(globalKRs: KRItem[]) {
  const trackerData = await loadTracker();
  await saveTracker({
    ...trackerData,
    globalKRs
  });
}

export async function loadGlobalKRs(): Promise<KRItem[]> {
  const trackerData = await loadTracker();
  return trackerData.globalKRs;
}

export async function saveFilterState(filterState: FilterState) {
  const trackerData = await loadTracker();
  await saveTracker({
    ...trackerData,
    filterState
  });
}

export async function loadFilterState(): Promise<FilterState> {
  const trackerData = await loadTracker();
  return trackerData.filterState;
}

export async function saveTrackerName(trackerName: string) {
  const trackerData = await loadTracker();
  await saveTracker({
    ...trackerData,
    trackerName
  });
}

export async function loadTrackerName(): Promise<string> {
  const trackerData = await loadTracker();
  return trackerData.trackerName;
}

// Share functionality
export async function createShare(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const shareId = Math.random().toString(36).substring(2, 15);
  
  const { error } = await supabase
    .from('shares')
    .insert({
      share_id: shareId,
      user_id: user.id,
      owner_id: user.id,
      is_active: true
    });

  if (error) {
    console.error('❌ Error creating share:', error);
    throw error;
  }

  return shareId;
}

export async function getShareData(shareId: string) {
  const { data, error } = await supabase
    .from('shares')
    .select(`
      share_id,
      owner_id,
      is_active,
      trackers!inner(
        projects,
        global_krs,
        filter_state,
        tracker_name
      )
    `)
    .eq('share_id', shareId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('❌ Error loading share data:', error);
    throw error;
  }

  return {
    projects: data.trackers.projects || [],
    globalKRs: data.trackers.global_krs || [],
    filterState: data.trackers.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority'
    },
    trackerName: data.trackers.tracker_name || ''
  };
}
