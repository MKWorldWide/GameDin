import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Group as GroupIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AddPersonIcon,
  PersonRemove as RemovePersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { IUser, IConversation, IConversationParticipant } from '../../types/social';
import useStore from '../../store/useStore';

interface GroupChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, participants: IUser[], admins: IUser[]) => void;
  existingGroup?: IConversation & { name: string };
  onUpdateGroup?: (name: string, addedUsers: IUser[], removedUsers: IUser[], addedAdmins: IUser[], removedAdmins: IUser[]) => void;
}

interface GroupParticipant extends IConversationParticipant {
  role: 'owner' | 'admin' | 'member';
}

const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingGroup,
  onUpdateGroup,
}) => {
  const [name, setName] = useState(existingGroup?.name || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [newAdmins, setNewAdmins] = useState<IUser[]>([]);
  const [removedUsers, setRemovedUsers] = useState<IUser[]>([]);
  const [removedAdmins, setRemovedAdmins] = useState<IUser[]>([]);
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useStore(state => state.user);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.users);
        setError(null);
      } catch (err) {
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectUser = (selectedUser: IUser) => {
    if (!selectedUsers.some(u => u.id === selectedUser.id)) {
      setSelectedUsers(prev => [...prev, selectedUser]);
    }
    setSearchQuery('');
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!existingGroup && selectedUsers.length === 0)) return;

    if (existingGroup && onUpdateGroup) {
      onUpdateGroup(name, selectedUsers, removedUsers, newAdmins, removedAdmins);
    } else {
      onSubmit(name, selectedUsers, newAdmins);
    }

    onClose();
  };

  const isUserAdmin = (userId: string): boolean => {
    if (!existingGroup) return false;
    const participant = existingGroup.participants.find(p => p.user.id === userId) as GroupParticipant;
    return participant?.role === 'admin' || participant?.role === 'owner';
  };

  const canManageUsers = (): boolean => {
    if (!existingGroup || !user) return true;
    const currentUserParticipant = existingGroup.participants.find(p => p.user.id === user.id) as GroupParticipant;
    return currentUserParticipant?.role === 'owner' || currentUserParticipant?.role === 'admin';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {existingGroup ? 'Edit Group Chat' : 'Create Group Chat'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text">Group Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>

              {canManageUsers() && (
                <div>
                  <label className="label">
                    <span className="label-text">Add Participants</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                  />

                  {loading && (
                    <div className="mt-2">
                      <div className="loading loading-spinner loading-sm"></div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-2 text-error text-sm">{error}</div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-base-200 rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map(result => (
                        <button
                          key={result.id}
                          type="button"
                          className="w-full p-2 hover:bg-base-300 flex items-center space-x-2"
                          onClick={() => handleSelectUser(result)}
                        >
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                              <img src={result.avatar} alt={result.username} />
                            </div>
                          </div>
                          <span>{result.username}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(selectedUsers.length > 0 || existingGroup) && (
                <div>
                  <label className="label">
                    <span className="label-text">Participants</span>
                  </label>
                  <div className="bg-base-200 rounded-lg p-4 space-y-2">
                    {existingGroup?.participants.map(participant => (
                      <div
                        key={participant.user.id}
                        className="flex items-center justify-between bg-base-100 rounded p-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                              <img src={participant.user.avatar} alt={participant.user.username} />
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{participant.user.username}</span>
                            {(participant as GroupParticipant).role === 'owner' && (
                              <span className="ml-2 badge badge-primary">Owner</span>
                            )}
                            {(participant as GroupParticipant).role === 'admin' && (
                              <span className="ml-2 badge badge-secondary">Admin</span>
                            )}
                          </div>
                        </div>

                        {canManageUsers() && participant.user.id !== user?.id && (
                          <div className="space-x-2">
                            {!(participant as GroupParticipant).role?.includes('admin') && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline"
                                onClick={() => setNewAdmins([...newAdmins, participant.user])}
                              >
                                Make Admin
                              </button>
                            )}
                            {(participant as GroupParticipant).role === 'admin' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline btn-warning"
                                onClick={() => setRemovedAdmins([...removedAdmins, participant.user])}
                              >
                                Remove Admin
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline btn-error"
                              onClick={() => setRemovedUsers([...removedUsers, participant.user])}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-base-100 rounded p-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full">
                              <img src={user.avatar} alt={user.username} />
                            </div>
                          </div>
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost btn-circle"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-base-300 p-4 flex justify-end space-x-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || (!existingGroup && selectedUsers.length === 0)}
            >
              {existingGroup ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatDialog;
