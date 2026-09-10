import { supabase } from '../lib/supabase';

export interface NotificationItem {
  id: string;
  profile_id?: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export const notificationsService = {
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`profile_id.eq.${userId},user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as NotificationItem[];
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
    return [];
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`profile_id.eq.${userId},user_id.eq.${userId}`);
      return !error;
    } catch {
      return false;
    }
  },

  // Realtime subscription helper
  subscribe(userId: string, onNewNotification: (notification: NotificationItem) => void) {
    const channel = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new as NotificationItem);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
