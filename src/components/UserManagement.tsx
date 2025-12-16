import { useEffect, useState } from 'react';
import { User, UserRole, useAuth, PermissionGuard } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../services/api';
import { toast } from 'react-toastify';

interface UserManagementProps {
  users?: User[];
}

export function UserManagement({ users = [] }: UserManagementProps) {
  const { user: currentUser } = useAuth();
  const [, setSelectedUser] = useState<User | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<User[]>(users);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await api.getUsers();
        setRemoteUsers(data || []);
      } catch (err) {
        toast.error('Failed to load users');
        setRemoteUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const usersList = users.length > 0 ? users : remoteUsers;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'moderator':
        return '🛡️';
      case 'viewer':
        return '👁️';
    }
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    api.updateUserRole(userId, newRole)
      .then(() => {
        toast.success('Role updated');
        setRemoteUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
      })
      .catch(() => toast.error('Failed to update role'));
  };

  const handleInviteUser = () => {
    api.inviteUser({ email: inviteEmail, role: inviteRole })
      .then(() => {
        toast.success('Invitation sent');
        setInviteEmail('');
        setShowInviteDialog(false);
      })
      .catch(() => toast.error('Failed to invite user'));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      api.deleteUser(userId)
        .then(() => {
          toast.success('User deleted');
          setRemoteUsers(prev => prev.filter(u => u.id !== userId));
        })
        .catch(() => toast.error('Failed to delete user'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">User Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage user roles and permissions
          </p>
        </div>

        <PermissionGuard permission="manage_users">
          <button
            onClick={() => setShowInviteDialog(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            ➕ Invite User
          </button>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
          <div className="text-3xl font-bold dark:text-white mt-2">{usersList.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Admins</div>
          <div className="text-3xl font-bold dark:text-white mt-2">
            {usersList.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Moderators</div>
          <div className="text-3xl font-bold dark:text-white mt-2">
            {usersList.filter(u => u.role === 'moderator').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Viewers</div>
          <div className="text-3xl font-bold dark:text-white mt-2">
            {usersList.filter(u => u.role === 'viewer').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {usersList.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">
                          {user.username}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PermissionGuard
                      permission="manage_users"
                      fallback={
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      }
                    >
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                        disabled={user.id === currentUser?.id}
                        className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user.role)} ${
                          user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="admin">👑 Admin</option>
                        <option value="moderator">🛡️ Moderator</option>
                        <option value="viewer">👁️ Viewer</option>
                      </select>
                    </PermissionGuard>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        View
                      </button>
                      <PermissionGuard permission="manage_users">
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Invite User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded dark:text-white"
                >
                  <option value="viewer">👁️ Viewer (Read-only)</option>
                  <option value="moderator">🛡️ Moderator (Moderate)</option>
                  <option value="admin">👑 Admin (Full access)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleInviteUser}
                disabled={!inviteEmail}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
              <button
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteEmail('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
