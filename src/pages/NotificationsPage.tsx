import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationsService } from '../services/notificationsService';
import type { NotificationItem } from '../services/notificationsService';
import { EmptyState, LoadingSkeleton } from '../components/ui/ArcticPearlComponents';
import { useToast } from '../components/ui/Toast';
import {
  Bell,
  Sparkles,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

export function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const data = await notificationsService.getNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime notifications
    if (user) {
      const unsubscribe = notificationsService.subscribe(user.id, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        addToast(`New notification: ${newNotif.title}`, 'info');
      });
      return unsubscribe;
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredList = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'potential_match':
        return <Sparkles className="w-4 h-4 text-primary-600" />;
      case 'new_message':
      case 'chat_request':
      case 'chat_accepted':
        return <MessageSquare className="w-4 h-4 text-[#7C3AED]" />;
      case 'recovery_status_change':
      case 'recovery_confirmation':
        return <ShieldCheck className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4 text-primary-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Campus Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-500 text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Live updates for potential item matches, chat requests, and recovery verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-white border border-border-default rounded-md shadow-card transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 border-b border-border-default mb-6 pb-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'ALL'
                ? 'bg-white text-primary-600 shadow-card border border-border-default'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'UNREAD'
                ? 'bg-white text-primary-600 shadow-card border border-border-default'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : filteredList.length === 0 ? (
          <EmptyState
            title="No notifications yet."
            description="You are completely caught up! We will notify you when a match is discovered or when someone contacts you regarding an item."
            actionLabel="View Campus Feed"
            onAction={() => (window.location.href = '/home')}
          />
        ) : (
          <div className="bg-white rounded-xl border border-border-default shadow-card divide-y divide-border-default overflow-hidden">
            {filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                  notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-[#EEF5FF]/40 hover:bg-[#EEF5FF]/60'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border-default flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-text-primary">{notif.title}</h4>
                    <span className="text-[10px] text-text-disabled whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{notif.message}</p>

                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 mt-2"
                    >
                      View details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
