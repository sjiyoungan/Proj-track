'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getUserBoards, createBoard } from '@/lib/supabaseService';
import { ManageAccessModal } from '@/components/ManageAccessModal';

interface Board {
  board_id: string;
  board_name: string;
  is_owner: boolean;
  access_level: string;
  owner_email: string;
  owner_name: string;
}

interface BoardSelectorProps {
  currentBoardId: string;
  onBoardChange: (boardId: string, accessLevel: string) => void;
  boardName: string;
}

export function BoardSelector({ currentBoardId, onBoardChange, boardName }: BoardSelectorProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuWidth, setMenuWidth] = useState(192); // Default width in pixels
  const [showManageModal, setShowManageModal] = useState(false);

  const calculateMenuWidth = () => {
    const strings = [
      'My boards',
      'Shared boards',
      'Add board',
      'Manage boards',
      'No shared boards yet'
    ];
    
    // Add board names
    boards.forEach(board => {
      strings.push(board.board_name);
      if (!board.is_owner) {
        strings.push(`by ${board.owner_name || board.owner_email}`);
      }
    });
    
    // Calculate approximate width based on character count
    // Roughly 8px per character for small text, plus padding
    const maxLength = Math.max(...strings.map(s => s.length));
    const calculatedWidth = Math.max(160, (maxLength * 8) + 40); // Min 160px, add 40px for padding/icons
    
    setMenuWidth(Math.min(calculatedWidth, 320)); // Cap at 320px max
  };

  const loadBoards = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading boards...');
      const userBoards = await getUserBoards();
      console.log('✅ Loaded boards:', userBoards);
      console.log('🔍 Board details:', userBoards.map((b: Board) => ({
        id: b.board_id,
        name: b.board_name,
        isOwner: b.is_owner,
        ownerEmail: b.owner_email
      })));
      setBoards(userBoards);
    } catch (error) {
      console.error('❌ Error loading boards:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      // If the database functions don't exist yet, show empty state
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    calculateMenuWidth();
  }, [boards]);

  const handleCreateBoard = async () => {
    try {
      const boardCount = boards.filter((b: Board) => b.is_owner).length + 1;
      const displayName = `New Board`;
      
      console.log('🔄 Creating new board:', displayName);
      const newBoard = await createBoard(displayName);
      console.log('✅ New board created:', newBoard);
      
      // Reload boards to include the new one
      console.log('🔄 Reloading boards...');
      await loadBoards();
      console.log('✅ Boards reloaded');
      
      // Switch to the new board
      console.log('🔄 Switching to new board:', newBoard.board_id);
      onBoardChange(newBoard.board_id, 'edit');
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error creating board:', error);
      alert('Failed to create board. Please run the database setup first.');
    }
  };

  const ownedBoards = boards.filter((b: Board) => b.is_owner);
  const sharedBoards = boards.filter((b: Board) => !b.is_owner);
  const currentBoard = boards.find((b: Board) => b.board_id === currentBoardId);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="animate-pulse h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none flex items-center justify-center" 
          style={{ 
            marginTop: '6px',
            outline: 'none',
            boxShadow: 'none',
            border: 'none'
          }}
        >
          <div 
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-slate-400 dark:border-t-slate-500"
            style={{ 
              borderRadius: '2px'
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" style={{ width: `${menuWidth}px` }} className="p-2">
        {/* Your Boards Section */}
        <div className="px-0 py-1">
          <div className="font-medium text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide px-2 pb-2" style={{ fontSize: '10px' }}>
            My boards
          </div>
          
          {/* Show all owned boards */}
          {ownedBoards.map((board) => (
            <div key={board.board_id} className={`flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
              <DropdownMenuItem 
                onClick={() => {
                  console.log('🔄 Switching to board:', board.board_id, board.board_display_name);
                  onBoardChange(board.board_id, board.access_level);
                  setIsOpen(false);
                }}
                className="flex-1 cursor-pointer bg-transparent hover:bg-transparent p-0"
              >
                <div className={`flex items-center px-2 py-1 rounded-full transition-opacity ${
                  board.board_id === currentBoardId 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:opacity-90' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}>
                  <span className="text-sm">{board.board_name}</span>
                </div>
              </DropdownMenuItem>
            </div>
          ))}
          
          {/* Add Board Button */}
          <DropdownMenuItem 
            onClick={handleCreateBoard}
            className="cursor-pointer text-black dark:text-white hover:text-black dark:hover:text-white text-xs py-2 px-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add board
          </DropdownMenuItem>
        </div>
        
        {/* Separator */}
        <DropdownMenuSeparator />
        
        {/* Boards Shared With You Section */}
        <div className="px-0 py-1">
          <div className="font-medium text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide px-2 pb-2" style={{ fontSize: '10px' }}>
            Shared boards
          </div>
          
          {sharedBoards.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-400 py-2 px-2" style={{ fontSize: '12px' }}>
              No shared boards yet
            </div>
          ) : (
            sharedBoards.map((board) => (
              <div key={board.board_id} className={`flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                <DropdownMenuItem 
                  onClick={() => {
                    console.log('🔄 Switching to shared board:', board.board_id, board.board_display_name);
                    onBoardChange(board.board_id, board.access_level);
                    setIsOpen(false);
                  }}
                  className="flex-1 cursor-pointer bg-transparent hover:bg-transparent p-0"
                >
                  <div className={`flex flex-col px-2 py-1 rounded-full transition-opacity ${
                    board.board_id === currentBoardId 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:opacity-90' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}>
                    <span className="text-sm">{board.board_name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      by {board.owner_name || board.owner_email}
                    </span>
                  </div>
                </DropdownMenuItem>
              </div>
            ))
          )}
        </div>
        
        {/* Separator */}
        <DropdownMenuSeparator />
        
        {/* Manage Boards Option */}
        <DropdownMenuItem 
          onClick={() => {
            setShowManageModal(true);
            setIsOpen(false);
          }}
          className="cursor-pointer py-1 px-2"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage boards
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      {/* Manage Access Modal */}
      <ManageAccessModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
      />
    </DropdownMenu>
  );
}

// Legacy export for backward compatibility
export const TrackerSelector = BoardSelector;
