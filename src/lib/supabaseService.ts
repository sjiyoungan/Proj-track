import { supabase } from './supabase';
import { Project, KRItem, FilterState } from '@/types/project';

// New unified board service functions using the boards table

export async function saveBoard(data: {
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  boardName: string;
}, boardId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('💾 Saving board data:', {
    user_id: user.id,
    projects_count: data.projects.length,
    globalKRs_count: data.globalKRs.length,
    boardName: data.boardName,
    filterState: data.filterState
  });
  
  if (!user) {
    console.log('❌ No user found for saving board');
    throw new Error('User not authenticated');
  }

  const upsertData: any = {
    user_id: user.id,
    projects: data.projects,
    global_krs: data.globalKRs,
    filter_state: data.filterState,
    board_name: data.boardName,
    updated_at: new Date().toISOString()
  };

  // If boardId is provided, update that specific board
  if (boardId) {
    upsertData.id = boardId;
  }
  
  console.log('🔍 Upsert data being sent:', upsertData);
  
  // First try to update existing record, then insert if none exists
  const { error: updateError } = await supabase
    .from('boards')
    .update(upsertData)
    .eq('user_id', user.id);

  // If no record exists, insert a new one
  if (updateError && updateError.code === 'PGRST116') {
    const { error: insertError } = await supabase
      .from('boards')
      .insert(upsertData);
    
    if (insertError) {
      console.error('❌ Error inserting board:', insertError);
      throw insertError;
    }
  } else if (updateError) {
    console.error('❌ Error updating board:', updateError);
    throw updateError;
  }
  
  console.log('✅ Board saved successfully for user:', user.id);
}

export async function loadBoard(boardId?: string): Promise<{
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  boardName: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('🔍 Loading board for user:', user?.id, user?.email);
  
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
      boardName: 'New Board'
    };
  }

  console.log('🔍 Loading board data for user:', user?.id, user?.email);
  
  let query = supabase
    .from('boards')
    .select('projects, global_krs, filter_state, board_name');
  
  if (boardId) {
    query = query.eq('id', boardId);
  } else {
    query = query.eq('user_id', user.id);
  }
  
  const { data, error } = await query;
  
  console.log('🔍 Database response:', { data, error });
  
  if (error) {
    console.error('❌ Error loading board:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    // Return empty data if no board exists yet
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
      boardName: 'New Board'
    };
  }
  
  // Handle multiple boards by taking the first one
  const boardData = data && data.length > 0 ? data[0] : null;
  
  if (!boardData) {
    console.log('❌ No board data found, returning empty data');
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
      boardName: 'New Board'
    };
  }
  
  console.log('✅ Board loaded successfully for user:', user.id);
  
  return {
    projects: boardData.projects || [],
    globalKRs: boardData.global_krs || [],
    filterState: boardData.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority'
    },
    boardName: boardData.board_name || 'New Board'
  };
}

// Individual save functions for specific data types
export async function saveProjects(projects: Project[]) {
  const boardData = await loadBoard();
  await saveBoard({
    ...boardData,
    projects
  });
}

export async function loadProjects(): Promise<Project[]> {
  const boardData = await loadBoard();
  return boardData.projects;
}

export async function saveGlobalKRs(globalKRs: KRItem[]) {
  const boardData = await loadBoard();
  await saveBoard({
    ...boardData,
    globalKRs
  });
}

export async function loadGlobalKRs(): Promise<KRItem[]> {
  const boardData = await loadBoard();
  return boardData.globalKRs;
}

export async function saveFilterState(filterState: FilterState) {
  const boardData = await loadBoard();
  await saveBoard({
    ...boardData,
    filterState
  });
}

export async function loadFilterState(): Promise<FilterState> {
  const boardData = await loadBoard();
  return boardData.filterState;
}

export async function saveBoardName(boardName: string) {
  const boardData = await loadBoard();
  await saveBoard({
    ...boardData,
    boardName
  });
}

export async function loadBoardName(): Promise<string> {
  const boardData = await loadBoard();
  return boardData.boardName;
}

// Get all boards accessible to the current user
export async function getUserBoards() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .rpc('get_user_boards', { user_email: user.email });

  if (error) {
    console.error('❌ Error loading user boards:', error);
    throw error;
  }

  return data || [];
}

// Create a new board
export async function createBoard(displayName: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  console.log('🔄 Creating board with data:', {
    user_id: user.id,
    owner_email: user.email,
    board_display_name: displayName
  });

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: user.id,
      owner_email: user.email,
      board_display_name: displayName,
      board_name: 'New Board',
      projects: [{
        id: '1',
        name: '',
        status: 'Initiative',
        priority: 'Medium',
        kr: '',
        plan: '',
        hyperlink: '',
        notes: ''
      }],
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
    console.error('❌ Error creating board:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log('✅ Board created successfully:', data);
  return data;
}

// Delete a board
export async function deleteBoard(boardId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', boardId)
    .eq('user_id', user.id); // Ensure user can only delete their own boards

  if (error) {
    console.error('❌ Error deleting board:', error);
    throw error;
  }

  return true;
}

// Load a specific board by ID
export async function loadBoardById(boardId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId);

  if (error) {
    console.error('❌ Error loading board by ID:', error);
    throw error;
  }

  const boardData = data && data.length > 0 ? data[0] : null;
  
  if (!boardData) {
    throw new Error('Board not found');
  }

  return {
    projects: boardData.projects || [],
    globalKRs: boardData.global_krs || [],
    filterState: boardData.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority-asc'
    },
    boardName: boardData.board_name || 'New Board',
    boardDisplayName: boardData.board_display_name || 'New Board'
  };
}

// Save a specific board by ID
export async function saveBoardById(boardId: string, data: {
  projects: Project[];
  globalKRs: KRItem[];
  filterState: FilterState;
  boardName: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('boards')
    .update({
      projects: data.projects,
      global_krs: data.globalKRs,
      filter_state: data.filterState,
      board_name: data.boardName,
      updated_at: new Date().toISOString()
    })
    .eq('id', boardId)
    .eq('user_id', user.id); // Ensure user owns the board

  if (error) {
    console.error('❌ Error saving board by ID:', error);
    throw error;
  }
}

// Legacy share functionality (keeping for backward compatibility)
export async function getShareData(shareId: string) {
  const { data, error } = await supabase
    .from('shares')
    .select(`
      share_id,
      owner_id,
      is_active,
      boards!inner(
        projects,
        global_krs,
        filter_state,
        board_name
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
    projects: data.boards.projects || [],
    globalKRs: data.boards.global_krs || [],
    filterState: data.boards.filter_state || {
      showInitiative: true,
      showKR: true,
      showPlan: true,
      showDone: true,
      showFuture: true,
      sortBy: 'priority'
    },
    boardName: data.boards.board_name || ''
  };
}

// Legacy functions for backward compatibility
export const saveTracker = saveBoard;
export const loadTracker = loadBoard;
export const saveTrackerName = saveBoardName;
export const loadTrackerName = loadBoardName;