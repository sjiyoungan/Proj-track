'use client';

import React, { useState, useEffect } from 'react';
import { X, Ban, Eye, Edit3, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserBoards, getBoardPermissions, revokeBoardAccess, updateBoardAccess, deleteBoard } from '@/lib/supabaseService';
import { ShareBoardModal } from '@/components/ShareTrackerModal';

interface Board {
  board_id: string;
  board_name: string;
  board_display_name: string;
  is_owner: boolean;
  access_level: string;
  owner_email: string;
  owner_name: string;
}

interface Permission {
  id: string;
  shared_with_email: string;
  shared_with_name: string;
  board_id: string;
  access_level: 'view' | 'edit';
  created_at: string;
}

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageAccessModal({ isOpen, onClose }: ManageAccessModalProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState<{id: string, boardId: string, email: string, name: string} | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [boardToShare, setBoardToShare] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{id: string, name: string} | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 ManageAccessModal: Loading data...');
      const userBoards = await getUserBoards();
      console.log('✅ ManageAccessModal: Loaded boards:', userBoards);
      setBoards(userBoards);
      
      // Load permissions for all owned boards
      const ownedBoards = userBoards.filter((b: Board) => b.is_owner);
      const allPermissions: Permission[] = [];
      
      for (const board of ownedBoards) {
        try {
          const boardPermissions = await getBoardPermissions(board.board_id);
          allPermissions.push(...boardPermissions);
        } catch (error) {
          console.error(`❌ Error loading permissions for board ${board.board_id}:`, error);
        }
      }
      
      console.log('✅ ManageAccessModal: Loaded permissions:', allPermissions);
      setPermissions(allPermissions);
    } catch (error) {
      console.error('❌ ManageAccessModal: Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRevokeAccess = async (permissionId: string, boardId: string, email: string, name: string) => {
    setPermissionToRevoke({ id: permissionId, boardId, email, name });
    setShowConfirmDialog(true);
  };

  const confirmRevokeAccess = async () => {
    if (!permissionToRevoke) return;
    
    try {
      setRevoking(permissionToRevoke.id);
      console.log('🔄 Revoking access for:', permissionToRevoke);
      
      await revokeBoardAccess(permissionToRevoke.boardId, permissionToRevoke.email);
      
      // Remove from local state
      setPermissions(prev => prev.filter((p: Permission) => p.id !== permissionToRevoke.id));
      
      console.log('✅ Access revoked successfully');
    } catch (error) {
      console.error('❌ Error revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    } finally {
      setRevoking(null);
      setShowConfirmDialog(false);
      setPermissionToRevoke(null);
    }
  };

  const handleUpdateAccess = async (permissionId: string, boardId: string, email: string, newLevel: 'view' | 'edit') => {
    try {
      console.log('🔄 Updating access level:', { permissionId, boardId, email, newLevel });
      
      await updateBoardAccess(boardId, email, newLevel);
      
      // Update local state
      setPermissions(prev => prev.map(p => 
        p.id === permissionId ? { ...p, access_level: newLevel } : p
      ));
      
      console.log('✅ Access level updated successfully');
    } catch (error) {
      console.error('❌ Error updating access level:', error);
      alert('Failed to update access level. Please try again.');
    }
  };

  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    setBoardToDelete({ id: boardId, name: boardName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    
    try {
      console.log('🔄 Deleting board:', boardToDelete);
      
      await deleteBoard(boardToDelete.id);
      
      // Remove from local state
      setBoards(prev => prev.filter((b: Board) => b.board_id !== boardToDelete.id));
      
      console.log('✅ Board deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setBoardToDelete(null);
    }
  };

  const handleShareBoard = (boardId: string) => {
    setBoardToShare(boardId);
    setShowShareModal(true);
  };

  const ownedBoards = boards.filter((b: Board) => b.is_owner);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Manage Boards
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Your Boards Section */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Your Boards
              </h3>
              
              {ownedBoards.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 py-4">
                  No boards found. Create a board to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {ownedBoards.map((board) => (
                    <div key={board.board_id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {board.board_display_name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {board.board_name || 'No description'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareBoard(board.board_id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBoard(board.board_id, board.board_display_name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Access Section */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Shared Access
              </h3>
              
              {permissions.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 py-4">
                  No shared access found.
                </div>
              ) : (
                <div className="space-y-3">
                  {permissions.map((permission) => {
                    const board = boards.find(b => b.board_id === permission.board_id);
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {permission.shared_with_name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {permission.shared_with_email} • {board?.board_display_name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant={permission.access_level === 'view' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdateAccess(permission.id, permission.board_id, permission.shared_with_email, 'view')}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant={permission.access_level === 'edit' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdateAccess(permission.id, permission.board_id, permission.shared_with_email, 'edit')}
                              className="text-xs"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeAccess(permission.id, permission.board_id, permission.shared_with_email, permission.shared_with_name)}
                            disabled={revoking === permission.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && permissionToRevoke && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Revoke Access
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to revoke access for {permissionToRevoke.name} ({permissionToRevoke.email})?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPermissionToRevoke(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRevokeAccess}
                  disabled={revoking === permissionToRevoke.id}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {revoking === permissionToRevoke.id ? 'Revoking...' : 'Revoke Access'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && boardToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Delete Board
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete "{boardToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBoardToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteBoard}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Board
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && boardToShare && (
          <ShareBoardModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setBoardToShare(null);
            }}
            boardId={boardToShare}
            boardName={boards.find(b => b.board_id === boardToShare)?.board_display_name || 'Board'}
          />
        )}
      </div>
    </div>
  );
}
