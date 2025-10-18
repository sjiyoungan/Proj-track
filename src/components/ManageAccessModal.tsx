'use client';

import React, { useState, useEffect } from 'react';
import { X, Ban, Eye, Edit3, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserTrackers, getTrackerPermissions, revokeTrackerAccess, updateTrackerAccess, deleteTracker } from '@/lib/supabaseService';
import { ShareTrackerModal } from '@/components/ShareTrackerModal';

interface Tracker {
  tracker_id: string;
  tracker_name: string;
  tracker_display_name: string;
  is_owner: boolean;
  access_level: string;
  owner_email: string;
  owner_name: string;
}

interface Permission {
  id: string;
  shared_with_email: string;
  shared_with_name: string;
  tracker_id: string;
  access_level: 'view' | 'edit';
  created_at: string;
}

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageAccessModal({ isOpen, onClose }: ManageAccessModalProps) {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState<{id: string, trackerId: string, email: string, name: string} | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [trackerToShare, setTrackerToShare] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trackerToDelete, setTrackerToDelete] = useState<{id: string, name: string} | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 ManageAccessModal: Loading data...');
      const userTrackers = await getUserTrackers();
      console.log('✅ ManageAccessModal: Loaded trackers:', userTrackers);
      setTrackers(userTrackers);

      // Load permissions for all owned trackers
      const ownedTrackers = userTrackers.filter((t: Tracker) => t.is_owner);
      console.log('🔄 ManageAccessModal: Found owned trackers:', ownedTrackers);
      const allPermissions: Permission[] = [];
      
      for (const tracker of ownedTrackers) {
        try {
          const trackerPermissions = await getTrackerPermissions(tracker.tracker_id);
          console.log(`🔄 ManageAccessModal: Loaded permissions for ${tracker.tracker_display_name}:`, trackerPermissions);
          // Attach tracker_display_name to each permission for easier rendering
          const permissionsWithTrackerName = trackerPermissions.map(p => ({
            ...p,
            tracker_display_name: tracker.tracker_display_name
          }));
          allPermissions.push(...permissionsWithTrackerName);
        } catch (error) {
          console.log(`⚠️ ManageAccessModal: Could not load permissions for ${tracker.tracker_display_name}:`, error);
        }
      }
      
      console.log('✅ ManageAccessModal: All permissions:', allPermissions);
      setPermissions(allPermissions);
    } catch (error) {
      console.error('❌ ManageAccessModal: Error loading access data:', error);
      // If database functions don't exist yet, show empty state
      setTrackers([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRevokeClick = (permission: Permission) => {
    setPermissionToRevoke({
      id: permission.id,
      trackerId: permission.tracker_id,
      email: permission.shared_with_email,
      name: permission.shared_with_name
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmRevoke = async () => {
    if (!permissionToRevoke) return;
    
    try {
      setRevoking(permissionToRevoke.id);
      await revokeTrackerAccess(permissionToRevoke.trackerId, permissionToRevoke.email);
      
      // Reload data to reflect changes
      await loadData();
      
      // Close confirmation dialog
      setShowConfirmDialog(false);
      setPermissionToRevoke(null);
    } catch (error) {
      console.error('❌ Error revoking access:', error);
      alert('Failed to revoke access. Please try again.');
    } finally {
      setRevoking(null);
    }
  };

  const handleCancelRevoke = () => {
    setShowConfirmDialog(false);
    setPermissionToRevoke(null);
  };

  const handleUpdateAccess = async (permissionId: string, trackerId: string, email: string, newAccessLevel: 'view' | 'edit') => {
    try {
      await updateTrackerAccess(trackerId, email, newAccessLevel);
      
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('❌ Error updating access:', error);
      alert('Failed to update access level. Please try again.');
    }
  };

  const handleDeleteClick = (tracker: Tracker) => {
    setTrackerToDelete({
      id: tracker.tracker_id,
      name: tracker.tracker_display_name
    });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!trackerToDelete) return;
    
    try {
      await deleteTracker(trackerToDelete.id);
      
      // Reload data to reflect changes
      await loadData();
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setTrackerToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting tracker:', error);
      alert('Failed to delete tracker. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTrackerToDelete(null);
  };

  const handleShareClick = (trackerId: string) => {
    setTrackerToShare(trackerId);
    setShowShareModal(true);
  };

  const ownedTrackers = trackers.filter(t => t.is_owner);
  const sharedTrackers = trackers.filter(t => !t.is_owner);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Manage Trackers
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
            {/* Trackers You Own */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Trackers You Own
              </h3>
              
              {ownedTrackers.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">No trackers found.</p>
              ) : (
                <div className="space-y-4">
                  {ownedTrackers.map((tracker) => {
                    const trackerPermissions = permissions.filter(p => p.tracker_id === tracker.tracker_id);
                    
                    return (
                      <div key={tracker.tracker_id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {tracker.tracker_display_name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {trackerPermissions.length} shared
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShareClick(tracker.tracker_id)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(tracker)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {trackerPermissions.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Not shared with anyone yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {trackerPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                      {permission.shared_with_name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {permission.shared_with_email}
                                    </p>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                      {tracker.tracker_display_name}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Access Level Toggle */}
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant={permission.access_level === 'view' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleUpdateAccess(permission.id, permission.tracker_id, permission.shared_with_email, 'view')}
                                      className="h-7 px-2"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant={permission.access_level === 'edit' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleUpdateAccess(permission.id, permission.tracker_id, permission.shared_with_email, 'edit')}
                                      className="h-7 px-2"
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  
                                  {/* Revoke Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevokeClick(permission)}
                                    disabled={revoking === permission.id}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    {revoking === permission.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Ban className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trackers Shared With You */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Trackers Shared With You
              </h3>
              
              {sharedTrackers.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">No shared trackers yet.</p>
              ) : (
                <div className="space-y-3">
                  {sharedTrackers.map((tracker) => (
                    <div key={tracker.tracker_id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {tracker.tracker_display_name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            by {tracker.owner_name || tracker.owner_email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tracker.access_level === 'edit' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {tracker.access_level === 'edit' ? 'Edit Access' : 'View Only'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && permissionToRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Are you sure you want to revoke access?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This will remove {permissionToRevoke.name}'s access to the tracker.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelRevoke}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRevoke}
                disabled={revoking === permissionToRevoke.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {revoking === permissionToRevoke.id ? 'Revoking...' : 'Revoke'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && trackerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Are you sure you want to delete this tracker?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              This will permanently delete "{trackerToDelete.name}" and all its data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Tracker Modal */}
      <ShareTrackerModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setTrackerToShare(null);
        }}
        trackerId={trackerToShare || ''}
        onShareSuccess={() => {
          loadData(); // Reload data to show updated sharing info
        }}
      />
    </div>
  );
}
