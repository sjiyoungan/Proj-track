import { supabase } from './supabase';
import { Project, KRItem, FilterState } from '@/types/project';

// New unified tracker service functions using the trackers table

export async function saveTracker(data: {
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  trackerName: string;
}, trackerId?: string) {
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

  const upsertData: any = {
    user_id: user.id,
    owner_email: user.email,
    projects: data.projects,
    global_krs: data.globalKRs,
    filter_state: data.filterState,
    tracker_name: data.trackerName,
    updated_at: new Date().toISOString()
  };

  // If trackerId is provided, update that specific tracker
  if (trackerId) {
    upsertData.tracker_id = trackerId;
  }
  
  console.log('🔍 Upsert data being sent:', upsertData);
  
  const { error } = await supabase
    .from('trackers')
    .upsert(upsertData, { onConflict: trackerId ? 'tracker_id' : 'user_id' });
  
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

export async function loadTracker(trackerId?: string): Promise<{
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
  
  let query = supabase
    .from('trackers')
    .select('projects, global_krs, filter_state, tracker_name');
  
  if (trackerId) {
    query = query.eq('tracker_id', trackerId);
  } else {
    query = query.eq('user_id', user.id);
  }
  
  const { data, error } = await query.single();
  
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

// New sharing system functions

// Get all trackers accessible to the current user
export async function getUserTrackers() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .rpc('get_user_trackers', { user_email: user.email });

  if (error) {
    console.error('❌ Error loading user trackers:', error);
    throw error;
  }

  return data || [];
}

// Create a new tracker
export async function createTracker(displayName: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('trackers')
    .insert({
      user_id: user.id,
      owner_email: user.email,
      tracker_display_name: displayName,
      tracker_name: '',
      projects: [],
      global_krs: [],
      filter_state: {
        showInitiative: true,
        showKR: true,
        showPlan: true,
        showDone: true,
        showFuture: true,
        sortBy: 'priority-asc'
      }
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating tracker:', error);
    throw error;
  }

  return data;
}

// Delete a tracker
export async function deleteTracker(trackerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('trackers')
    .delete()
    .eq('tracker_id', trackerId)
    .eq('user_id', user.id); // Ensure user can only delete their own trackers

  if (error) {
    console.error('❌ Error deleting tracker:', error);
    throw error;
  }

  return true;
}

// Load a specific tracker by ID
export async function loadTrackerById(trackerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('trackers')
    .select('*')
    .eq('id', trackerId)
    .single();

  if (error) {
    console.error('❌ Error loading tracker by ID:', error);
    throw error;
  }

  return {
    projects: data.projects || [],
    globalKRs: data.global_krs || [],
    filterState: data.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority-asc'
    },
    trackerName: data.tracker_name || '',
    trackerDisplayName: data.tracker_display_name || 'My Tracker'
  };
}

// Save a specific tracker by ID
export async function saveTrackerById(trackerId: string, data: {
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  trackerName: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('trackers')
    .update({
      projects: data.projects,
      global_krs: data.globalKRs,
      filter_state: data.filterState,
      tracker_name: data.trackerName,
      updated_at: new Date().toISOString()
    })
    .eq('id', trackerId)
    .eq('user_id', user.id); // Ensure user owns the tracker

  if (error) {
    console.error('❌ Error saving tracker by ID:', error);
    throw error;
  }
}

// Share a tracker with someone
export async function shareTracker(trackerId: string, sharedWithEmail: string, sharedWithName: string, accessLevel: 'view' | 'edit' = 'edit') {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('sharing_permissions')
    .insert({
      owner_id: user.id,
      shared_with_email: sharedWithEmail,
      shared_with_name: sharedWithName,
      tracker_id: trackerId,
      access_level: accessLevel
    });

  if (error) {
    console.error('❌ Error sharing tracker:', error);
    throw error;
  }
}

// Get sharing permissions for a tracker
export async function getTrackerPermissions(trackerId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('sharing_permissions')
    .select('*')
    .eq('tracker_id', trackerId)
    .eq('owner_id', user.id);

  if (error) {
    console.error('❌ Error loading tracker permissions:', error);
    throw error;
  }

  return data || [];
}

// Revoke access to a tracker
export async function revokeTrackerAccess(trackerId: string, sharedWithEmail: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('sharing_permissions')
    .delete()
    .eq('tracker_id', trackerId)
    .eq('owner_id', user.id)
    .eq('shared_with_email', sharedWithEmail);

  if (error) {
    console.error('❌ Error revoking tracker access:', error);
    throw error;
  }
}

// Update access level for a tracker
export async function updateTrackerAccess(trackerId: string, sharedWithEmail: string, accessLevel: 'view' | 'edit') {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('sharing_permissions')
    .update({ access_level: accessLevel })
    .eq('tracker_id', trackerId)
    .eq('owner_id', user.id)
    .eq('shared_with_email', sharedWithEmail);

  if (error) {
    console.error('❌ Error updating tracker access:', error);
    throw error;
  }
}

// Legacy share functionality (keeping for backward compatibility)
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
