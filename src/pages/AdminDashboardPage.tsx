import { useState } from 'react';
import { LayoutDashboard, CheckCircle, Clock, Trash, Package, Users, Star, UserCheck, Shield } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import './AdminDashboardPage.css';

interface AdminItem {
  id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  date: string;
  status: 'open' | 'resolved' | 'pending';
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  joinDate: string;
}

const INITIAL_REPORT_ITEMS: AdminItem[] = [
  { id: '1', title: 'iPhone 13 Red', type: 'found', category: 'Electronics', date: '2026-06-13', status: 'pending' },
  { id: '2', title: 'Calculus Text Book', type: 'lost', category: 'Books & Notes', date: '2026-06-12', status: 'open' },
  { id: '3', title: 'MacBook Pro 14"', type: 'lost', category: 'Electronics', date: '2026-06-12', status: 'open' },
  { id: '4', title: 'Dorm Keys Ring', type: 'found', category: 'Keys', date: '2026-06-13', status: 'pending' },
  { id: '5', title: 'Beige Knit Scarf', type: 'found', category: 'Clothing', date: '2026-06-10', status: 'resolved' },
  { id: '6', title: 'Sony WH-1000XM4', type: 'lost', category: 'Electronics', date: '2026-06-10', status: 'resolved' },
  { id: '7', title: 'Wilson Basketball', type: 'lost', category: 'Sports Equipment', date: '2026-06-07', status: 'resolved' },
  { id: '8', title: 'Eastpak Backpack', type: 'lost', category: 'Bags & Wallets', date: '2026-06-08', status: 'resolved' },
];

const INITIAL_USERS: AdminUser[] = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex.j@college.edu', role: 'admin', joinDate: '2026-02-15' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah.m@college.edu', role: 'user', joinDate: '2026-04-10' },
  { id: 'u3', name: 'Devon Carter', email: 'd.carter@college.edu', role: 'user', joinDate: '2026-05-01' },
  { id: 'u4', name: 'Emily Watson', email: 'emily.w@college.edu', role: 'user', joinDate: '2026-05-12' },
  { id: 'u5', name: 'Ryan Cooper', email: 'ryan.c@college.edu', role: 'admin', joinDate: '2026-01-20' },
];

export function AdminDashboardPage() {
  const { addToast } = useToast();
  const [reports, setReports] = useState<AdminItem[]>(INITIAL_REPORT_ITEMS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);

  const handleApprove = (id: string) => {
    setReports((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'open' } : item))
    );
    addToast('Report approved and published successfully!', 'success');
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports((prev) => prev.filter((item) => item.id !== id));
      addToast('Report deleted from database.', 'info');
    }
  };

  const toggleUserRole = (id: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const newRole = user.role === 'admin' ? 'user' : 'admin';
          addToast(
            `${user.name} is now a ${newRole === 'admin' ? 'Dashboard Administrator' : 'Standard User'}!`,
            'info'
          );
          return { ...user, role: newRole };
        }
        return user;
      })
    );
  };

  // Derived stats
  const totalItemsCount = reports.length + 239; // simulating larger database history
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length + 150;
  const activeUsersCount = users.length + 84;

  return (
    <div className="admin-page page-container">
      <div className="container">
        {/* Page Title */}
        <div className="admin-page__header">
          <LayoutDashboard size={28} className="admin-page__header-icon" />
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle">
              Manage reported item moderation, user access control, and campus statistics.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-page__stats">
          <div className="glass-card stat-card-admin">
            <div className="stat-card-admin__icon bg-purple">
              <Package size={22} />
            </div>
            <div className="stat-card-admin__info">
              <span className="stat-card-admin__num">{totalItemsCount}</span>
              <span className="stat-card-admin__label">Total Logs Filed</span>
            </div>
            <span className="stat-card-admin__badge positive">+12%</span>
          </div>

          <div className="glass-card stat-card-admin">
            <div className="stat-card-admin__icon bg-yellow">
              <Clock size={22} />
            </div>
            <div className="stat-card-admin__info">
              <span className="stat-card-admin__num">{pendingCount}</span>
              <span className="stat-card-admin__label">Pending Moderation</span>
            </div>
            {pendingCount > 0 && (
              <span className="stat-card-admin__badge warning">Action Req.</span>
            )}
          </div>

          <div className="glass-card stat-card-admin">
            <div className="stat-card-admin__icon bg-green">
              <CheckCircle size={22} />
            </div>
            <div className="stat-card-admin__info">
              <span className="stat-card-admin__num">{resolvedCount}</span>
              <span className="stat-card-admin__label">Items Resolved</span>
            </div>
            <span className="stat-card-admin__badge positive">93%</span>
          </div>

          <div className="glass-card stat-card-admin">
            <div className="stat-card-admin__icon bg-teal">
              <Users size={22} />
            </div>
            <div className="stat-card-admin__info">
              <span className="stat-card-admin__num">{activeUsersCount}</span>
              <span className="stat-card-admin__label">Registered Users</span>
            </div>
            <span className="stat-card-admin__badge positive">+8 new</span>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="admin-page__content-grid">
          {/* Recent Reports Table */}
          <div className="glass-card table-card">
            <div className="table-card__header">
              <h2 className="table-card__title">Recent Item Logs</h2>
              <span className="table-card__subtitle">Moderate newly uploaded campus posts</span>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date Filed</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.title}</td>
                      <td>
                        <Badge variant={item.type === 'lost' ? 'lost' : 'found'}>
                          {item.type}
                        </Badge>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.date}</td>
                      <td>
                        <Badge
                          variant={
                            item.status === 'open'
                              ? 'info'
                              : item.status === 'resolved'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {item.status === 'pending' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="approve-btn"
                              onClick={() => handleApprove(item.id)}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="delete-report-btn"
                            onClick={() => handleDeleteReport(item.id)}
                            icon={<Trash size={14} />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Management Section */}
          <div className="glass-card user-card">
            <div className="user-card__header">
              <h2 className="user-card__title">User Permissions</h2>
              <span className="user-card__subtitle">Assign roles and verify coordinators</span>
            </div>

            <div className="user-list">
              {users.map((user) => {
                const initials = user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('');

                return (
                  <div key={user.id} className="user-row">
                    <div className="user-avatar-circle">{initials}</div>
                    <div className="user-details">
                      <div className="user-name-role">
                        <span className="user-name">{user.name}</span>
                        {user.role === 'admin' ? (
                          <Badge variant="info" className="admin-badge-role">
                            <Shield size={10} style={{ marginRight: 3 }} />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="admin-badge-role">
                            User
                          </Badge>
                        )}
                      </div>
                      <span className="user-email">{user.email}</span>
                    </div>

                    <button
                      className={`role-toggle-btn ${user.role === 'admin' ? 'demote' : 'promote'}`}
                      onClick={() => toggleUserRole(user.id)}
                      title={user.role === 'admin' ? 'Revoke Administrator Permissions' : 'Grant Administrator Permissions'}
                    >
                      {user.role === 'admin' ? <Star size={14} /> : <UserCheck size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
