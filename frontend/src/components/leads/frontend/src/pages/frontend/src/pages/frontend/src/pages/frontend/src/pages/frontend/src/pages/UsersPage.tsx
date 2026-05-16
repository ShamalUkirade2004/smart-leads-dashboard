import React, { useEffect, useState } from 'react';
import { Shield, Trash2, UserCog, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usersApi, AppUser } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button, Spinner, EmptyState, Modal } from '../components/ui';
import { UserRole } from '../types';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getUsers();
      if (res.success) setUsers(res.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleToggle = async (u: AppUser) => {
    const newRole: UserRole = u.role === 'admin' ? 'sales' : 'admin';
    setUpdatingId(u._id);
    try {
      const res = await usersApi.updateRole(u._id, newRole);
      if (res.success) {
        setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: newRole } : x)));
        toast.success(`Role updated to ${newRole}`);
      }
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete._id);
    try {
      await usersApi.deleteUser(confirmDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== confirmDelete._id));
      toast.success('User deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-600" />
              User Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Admin-only — manage team members and roles
            </p>
          </div>
          <Button variant="secondary" onClick={fetchUsers} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No registered users yet."
            icon={<UserCog className="h-8 w-8" />}
          />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3.5 font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left px-6 py-3.5 font-medium text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left px-6 py-3.5 font-medium text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left px-6 py-3.5 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-right px-6 py-3.5 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?.id;
                    return (
                      <tr
                        key={u._id}
                        className={`transition-colors ${isSelf ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {u.name}
                              {isSelf && <span className="ml-2 text-xs text-brand-500 font-normal">(you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <Badge variant={u.role === 'admin' ? 'info' : 'gray'}>{u.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {!isSelf && (
                              <>
                                <button
                                  onClick={() => handleRoleToggle(u)}
                                  disabled={updatingId === u._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-colors disabled:opacity-50"
                                >
                                  <UserCog className="h-3.5 w-3.5" />
                                  {updatingId === u._id ? 'Updating…' : `Make ${u.role === 'admin' ? 'Sales' : 'Admin'}`}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(u)}
                                  disabled={deletingId === u._id}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <p className="text-xs text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900 dark:text-white">{confirmDelete?.name}</strong>?
            Their leads will remain but they will lose access.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={!!deletingId}>Delete User</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default UsersPage;
