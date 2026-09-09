import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '../../services/adminService';
import type { AdminUserStat } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import { LoadingSkeleton, EmptyState } from '../../components/ui/ArcticPearlComponents';
import {
  Search,
  ArrowUpDown
} from 'lucide-react';

export function AdminUsersPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<AdminUserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortByReports, setSortByReports] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminService.getUserStatistics();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!user) return;
    const ok = await adminService.updateUserRole(userId, newRole, user.id);
    if (ok) {
      addToast(`User role updated to ${newRole}.`, 'success');
      loadUsers();
    } else {
      addToast('Failed to update role', 'error');
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    if (!user) return;
    const ok = await adminService.toggleUserStatus(userId, currentActive, user.id);
    if (ok) {
      addToast(`User account status updated.`, 'info');
      loadUsers();
    } else {
      addToast('Failed to toggle status', 'error');
    }
  };

  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      const matchesSearch =
        !search ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
        (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortByReports) {
      list = list.sort((a, b) => b.total_reports_count - a.total_reports_count);
    }
    return list;
  }, [users, search, roleFilter, sortByReports]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Student & Staff Directory</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Campus user account management, reporting activity counts, and role authorization
            </p>
          </div>
          <div className="px-3 py-1 bg-white border border-border-default rounded-md text-xs font-semibold text-text-secondary shadow-card">
            Total Users: <strong className="text-text-primary">{users.length}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-border-default shadow-card flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-disabled absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, roll no, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-subtle border border-border-default rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-surface-subtle border border-border-default rounded px-3 py-1.5 text-xs text-text-primary font-medium focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="user">Students / Users</option>
              <option value="admin">Administrators</option>
              <option value="super_admin">Super Admins</option>
            </select>

            <button
              onClick={() => setSortByReports(!sortByReports)}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                sortByReports
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-text-secondary border-border-default hover:bg-slate-50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by Reports
            </button>
          </div>
        </div>

        {/* User Data Table */}
        <div className="bg-white rounded-xl border border-border-default shadow-card overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title="No users found."
              description="No registered campus accounts match your search criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle border-b border-border-default text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Campus User</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Lost Reported</th>
                    <th className="px-5 py-3.5 text-center">Found Reported</th>
                    <th className="px-5 py-3.5 text-center">Total Reports</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredUsers.map((u) => (
                    <tr key={u.profile_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold flex items-center justify-center flex-shrink-0">
                            {u.full_name.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-text-primary block">{u.full_name}</span>
                            <span className="text-[11px] text-text-secondary">
                              @{u.username || 'student'} • {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-text-secondary max-w-xs truncate">
                        {u.department || 'SVCE Engineering'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' || u.role === 'super_admin'
                              ? 'bg-primary-50 text-primary-700 border border-primary-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            u.is_active ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? 'bg-success' : 'bg-error'
                            }`}
                          />
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center font-semibold text-warning">
                        {u.lost_reports_count}
                      </td>

                      <td className="px-5 py-3.5 text-center font-semibold text-primary-600">
                        {u.found_reports_count}
                      </td>

                      <td className="px-5 py-3.5 text-center font-bold text-text-primary">
                        {u.total_reports_count}
                      </td>

                      <td className="px-5 py-3.5 text-text-disabled">
                        {new Date(u.joined_date).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {/* Toggle Role */}
                        <button
                          onClick={() =>
                            handleRoleChange(
                              u.profile_id,
                              u.role === 'admin' ? 'user' : 'admin'
                            )
                          }
                          className="px-2 py-1 text-[11px] font-semibold text-text-secondary hover:text-primary-600 bg-surface-subtle hover:bg-slate-100 rounded border border-border-default transition-colors"
                          title="Change Role"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(u.profile_id, u.is_active)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors ${
                            u.is_active
                              ? 'text-red-600 hover:bg-red-50 border-red-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
