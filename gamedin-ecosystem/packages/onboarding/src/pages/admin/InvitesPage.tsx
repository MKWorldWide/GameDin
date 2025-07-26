import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PlusIcon, ClipboardCopyIcon, TrashIcon, FilterIcon } from '@heroicons/react/outline';
import { Button, Table, Badge, Pagination, Select, Input, Modal, Alert, Spinner } from '../../components/ui';
import { useApi } from '../../lib/api';

type InviteCode = {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string;
  usedAt?: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  role: string;
  createdAt: string;
  isExpired: boolean;
};

const InvitesPage: React.FC = () => {
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    sortBy: 'newest',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteCode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newInvite, setNewInvite] = useState({
    role: 'player',
    maxUses: 1,
    expiresInDays: 7,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<{ code: string; url: string } | null>(null);
  
  const api = useApi();
  const navigate = useNavigate();
  
  // Fetch invites with filters and pagination
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        sortBy: filters.sortBy,
      });
      
      const response = await api.get(`/admin/invites?${params.toString()}`);
      
      setInvites(response.data.invites);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.total,
      }));
    } catch (err) {
      console.error('Error fetching invites:', err);
      setError('Failed to load invite codes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [api, filters, pagination.page, pagination.pageSize, searchTerm]);
  
  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);
  
  // Handle invite code creation
  const handleCreateInvite = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      
      const response = await api.post('/admin/invites', {
        role: newInvite.role,
        maxUses: newInvite.maxUses,
        expiresInDays: newInvite.expiresInDays,
      });
      
      // Show success message
      setSuccessMessage('Invite code created successfully!');
      
      // Show the created invite code
      setCreatedInvite({
        code: response.data.code,
        url: `${window.location.origin}/signup?invite=${response.data.code}`,
      });
      
      // Refresh the invites list
      await fetchInvites();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error creating invite:', err);
      setCreateError('Failed to create invite code. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };
  
  // Handle invite code deletion
  const handleDeleteInvite = async () => {
    if (!selectedInvite) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await api.delete(`/admin/invites/${selectedInvite.id}`);
      
      // Refresh invites list
      await fetchInvites();
      
      // Show success message
      setSuccessMessage('Invite code deleted successfully!');
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedInvite(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting invite:', err);
      setDeleteError('Failed to delete invite code. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };
  
  // Copy invite code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show a temporary tooltip or toast
    const prevMessage = successMessage;
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(prevMessage), 2000);
  };
  
  // Get status badge color
  const getStatusBadgeColor = (invite: InviteCode) => {
    if (invite.isExpired) return 'gray';
    if (invite.usedBy) return 'green';
    if (invite.useCount >= invite.maxUses) return 'red';
    return 'blue';
  };
  
  // Get status text
  const getStatusText = (invite: InviteCode) => {
    if (invite.isExpired) return 'Expired';
    if (invite.usedBy) return 'Used';
    if (invite.useCount >= invite.maxUses) return 'Max Uses Reached';
    return 'Active';
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Invite Codes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage invitation codes for new users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => setShowCreateModal(true)}
          >
            Create invite
          </Button>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <form className="flex-1" onSubmit={handleSearch}>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search invite codes..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="min-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="creator">Creator</option>
            <option value="player">Player</option>
          </Select>
          
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </Select>
          
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="min-w-[150px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="expiring">Expiring Soon</option>
          </Select>
          
          <Button variant="secondary" icon={FilterIcon}>
            Filter
          </Button>
        </div>
      </div>
      
      {/* Success/error messages */}
      {successMessage && (
        <div className="mt-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />
        </div>
      )}
      
      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}
      
      {/* Invites table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Header>Code</Table.Header>
                      <Table.Header>Role</Table.Header>
                      <Table.Header>Status</Table.Header>
                      <Table.Header>Uses</Table.Header>
                      <Table.Header>Expires</Table.Header>
                      <Table.Header>Created</Table.Header>
                      <Table.Header align="right">Actions</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {invites.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                          No invite codes found. Try adjusting your search or filters, or create a new invite code.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      invites.map((invite) => (
                        <Table.Row key={invite.id}>
                          <Table.Cell>
                            <div className="flex items-center">
                              <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {invite.code}
                              </code>
                              <button
                                onClick={() => copyToClipboard(invite.code)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                                title="Copy to clipboard"
                              >
                                <ClipboardCopyIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color={getRoleBadgeColor(invite.role)}>
                              {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color={getStatusBadgeColor(invite)}>
                              {getStatusText(invite)}
                            </Badge>
                            {invite.usedBy && (
                              <div className="text-xs text-gray-500 mt-1">
                                Used by {invite.usedBy}
                              </div>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {invite.useCount} / {invite.maxUses}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDate(invite.expiresAt)}
                            {invite.isExpired && (
                              <div className="text-xs text-red-500">Expired</div>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {formatDate(invite.createdAt)}
                          </Table.Cell>
                          <Table.Cell align="right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={ClipboardCopyIcon}
                                onClick={() => {
                                  const url = `${window.location.origin}/signup?invite=${invite.code}`;
                                  copyToClipboard(url);
                                }}
                                title="Copy invite link"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={TrashIcon}
                                onClick={() => {
                                  setSelectedInvite(invite);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete invite"
                                className="text-red-600 hover:bg-red-50"
                                disabled={invite.usedBy !== undefined}
                              />
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              )}
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        {pagination.totalItems > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">
                {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalItems)}
              </span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
              </span>{' '}
              of <span className="font-medium">{pagination.totalItems}</span> invites
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.totalItems / pagination.pageSize)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Create Invite Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null);
          setCreatedInvite(null);
          setNewInvite({
            role: 'player',
            maxUses: 1,
            expiresInDays: 7,
          });
        }}
        title={createdInvite ? 'Invite Code Created' : 'Create New Invite'}
        footer={
          createdInvite ? (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreatedInvite(null);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateInvite}
                loading={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Invite'}
              </Button>
            </div>
          )
        }
      >
        {createError && (
          <div className="mb-4">
            <Alert type="error" message={createError} />
          </div>
        )}
        
        {createdInvite ? (
          <div>
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">Your invite code has been created successfully!</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                <div className="flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                      type="text"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      value={createdInvite.code}
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    onClick={() => copyToClipboard(createdInvite.code)}
                  >
                    <ClipboardCopyIcon className="h-5 w-5 text-gray-400" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Link</label>
                <div className="flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                      type="text"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      value={createdInvite.url}
                      readOnly
                    />
                  </div>
                  <button
                    type="button"
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    onClick={() => copyToClipboard(createdInvite.url)}
                  >
                    <ClipboardCopyIcon className="h-5 w-5 text-gray-400" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please save this information now. For security reasons, you won't be able to see this invite code again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <Select
                id="role"
                value={newInvite.role}
                onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                className="mt-1 block w-full"
              >
                <option value="player">Player</option>
                <option value="creator">Creator</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
                Maximum Uses
              </label>
              <Input
                type="number"
                id="maxUses"
                min="1"
                value={newInvite.maxUses}
                onChange={(e) => setNewInvite({ ...newInvite, maxUses: parseInt(e.target.value) || 1 })}
                className="mt-1 block w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of times this invite can be used (1-1000)
              </p>
            </div>
            
            <div>
              <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700">
                Expires In
              </label>
              <Select
                id="expiresInDays"
                value={newInvite.expiresInDays}
                onChange={(e) => setNewInvite({ ...newInvite, expiresInDays: parseInt(e.target.value) })}
                className="mt-1 block w-full"
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
                <option value="3650">Never</option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedInvite(null);
          setDeleteError(null);
        }}
        title="Delete Invite Code"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedInvite(null);
                setDeleteError(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteInvite}
              loading={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        {deleteError && (
          <div className="mb-4">
            <Alert type="error" message={deleteError} />
          </div>
        )}
        
        <p className="text-gray-700">
          Are you sure you want to delete the invite code <code className="font-mono bg-gray-100 px-1">{selectedInvite?.code}</code>?
          This action cannot be undone.
        </p>
        
        {selectedInvite?.useCount && selectedInvite.useCount > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This invite code has been used {selectedInvite.useCount} time(s). Deleting it may affect user access.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper function to get role badge color (matching the one in UsersPage)
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'purple';
    case 'moderator':
      return 'indigo';
    case 'creator':
      return 'pink';
    case 'player':
      return 'green';
    default:
      return 'gray';
  }
};

export default InvitesPage;
