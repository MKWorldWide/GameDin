import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, FilterIcon, PencilIcon, TrashIcon, UserAddIcon } from '@heroicons/react/outline';
import { Spinner, Button, Table, Badge, Pagination, Select, Input, Modal, Alert } from '../components/ui';
import { useApi } from '../../lib/api';
import { User } from '../../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    sortBy: 'newest',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const api = useApi();
  const navigate = useNavigate();
  
  // Fetch users with filters and pagination
  const fetchUsers = useCallback(async () => {
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
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      
      setUsers(response.data.users);
      setPagination(prev => ({
        ...prev,
        totalItems: response.data.total,
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [api, filters, pagination.page, pagination.pageSize, searchTerm]);
  
  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError(null);
      
      await api.delete(`/admin/users/${selectedUser.id}`);
      
      // Refresh users list
      await fetchUsers();
      
      // Show success message
      setSuccessMessage(`User ${selectedUser.email} has been deleted successfully.`);
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setDeleteError('Failed to delete user. Please try again.');
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
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'suspended':
        return 'red';
      case 'pending':
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  // Get role badge color
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
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users including their name, email, role, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            variant="primary"
            icon={UserAddIcon}
            onClick={() => navigate('/admin/users/new')}
          >
            Add user
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
              placeholder="Search users..."
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
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>
          
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="min-w-[150px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
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
      
      {/* Users table */}
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
                      <Table.Header>Name</Table.Header>
                      <Table.Header>Email</Table.Header>
                      <Table.Header>Role</Table.Header>
                      <Table.Header>Status</Table.Header>
                      <Table.Header>Joined</Table.Header>
                      <Table.Header align="right">Actions</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {users.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found. Try adjusting your search or filters.
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      users.map((user) => (
                        <Table.Row key={user.id}>
                          <Table.Cell>
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}`}
                                  alt={user.displayName || 'User'}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {user.displayName || 'No name'}
                                </div>
                                <div className="text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="text-gray-900">{user.email}</div>
                            {user.emailVerified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color={getRoleBadgeColor(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge color={getStatusBadgeColor(user.status || 'active')}>
                              {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {new Date(user.createdAt).toLocaleTimeString()}
                            </div>
                          </Table.Cell>
                          <Table.Cell align="right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={PencilIcon}
                                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                                title="Edit user"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={TrashIcon}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete user"
                                className="text-red-600 hover:bg-red-50"
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
              of <span className="font-medium">{pagination.totalItems}</span> users
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.totalItems / pagination.pageSize)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
          setDeleteError(null);
        }}
        title="Delete User"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
                setDeleteError(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
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
          Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.email}</span>?
          This action cannot be undone.
        </p>
        
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This will permanently delete the user account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
