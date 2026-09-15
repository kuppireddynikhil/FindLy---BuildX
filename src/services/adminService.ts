import { supabase } from '../lib/supabase';

export interface AdminUserStat {
  profile_id: string;
  email: string;
  full_name: string;
  username?: string;
  phone?: string;
  department?: string;
  role: string;
  is_active: boolean;
  account_status?: string;
  joined_date: string;
  lost_reports_count: number;
  found_reports_count: number;
  total_reports_count: number;
}

export interface AdminKpis {
  totalUsers: number;
  lostReports: number;
  foundReports: number;
  matchRate: number;
  activeReports: number;
  recoveryCases: number;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
  actor_name?: string;
}

export const adminService = {
  // 1. Fetch real Admin Dashboard KPIs from Supabase
  async getAdminKpis(): Promise<AdminKpis> {
    try {
      // 1. Users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 2. Reports counts
      const { count: lostCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .ilike('type', 'LOST');

      const { count: foundCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .ilike('type', 'FOUND');

      const { count: activeCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

      // 3. Recovery cases count
      const { count: recoveryCount } = await supabase
        .from('recovery_cases')
        .select('*', { count: 'exact', head: true });

      // 4. Matches count
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      const totalRep = (lostCount || 0) + (foundCount || 0);
      const matchRate = totalRep > 0 ? Math.round(((matchesCount || 0) * 2 / totalRep) * 100) : 0;

      return {
        totalUsers: usersCount || 0,
        lostReports: lostCount || 0,
        foundReports: foundCount || 0,
        matchRate: Math.min(100, matchRate),
        activeReports: activeCount || 0,
        recoveryCases: recoveryCount || 0,
      };
    } catch (err) {
      console.error('Error fetching admin KPIs:', err);
      return {
        totalUsers: 0,
        lostReports: 0,
        foundReports: 0,
        matchRate: 0,
        activeReports: 0,
        recoveryCases: 0,
      };
    }
  },

  // 2. Fetch user statistics with exact Lost, Found, and Total counts
  async getUserStatistics(search?: string): Promise<AdminUserStat[]> {
    try {
      // Try calling RPC get_admin_user_statistics
      const { data, error } = await supabase.rpc('get_admin_user_statistics', {
        p_search: search || null,
        p_role_filter: null,
      });

      if (!error && data && data.length > 0) {
        return data as AdminUserStat[];
      }

      // Query profiles and calculate aggregate counts
      let query = supabase.from('profiles').select('*');
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
      }
      const { data: profiles } = await query;

      if (profiles && profiles.length > 0) {
        // Fetch all reports to aggregate per user
        const { data: allReports } = await supabase.from('reports').select('reporter_id, type');

        return profiles.map((p: any) => {
          const userReports = (allReports || []).filter((r: any) => r.reporter_id === p.id);
          const lostCount = userReports.filter((r: any) => (r.type || '').toUpperCase() === 'LOST').length;
          const foundCount = userReports.filter((r: any) => (r.type || '').toUpperCase() === 'FOUND').length;

          return {
            profile_id: p.id,
            email: p.email,
            full_name: p.full_name || p.email?.split('@')[0] || 'User',
            username: p.username || p.email?.split('@')[0],
            phone: p.phone,
            department: p.department || 'General Campus',
            role: p.role || 'user',
            is_active: p.is_active !== false && p.account_status !== 'disabled',
            account_status: p.account_status || 'active',
            joined_date: p.created_at,
            lost_reports_count: lostCount,
            found_reports_count: foundCount,
            total_reports_count: lostCount + foundCount,
          };
        });
      }
    } catch (err) {
      console.error('Error fetching admin user statistics:', err);
    }
    return [];
  },

  // 3. Update user role
  async updateUserRole(userId: string, newRole: string, actorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      await this.logAudit(actorId, 'ROLE_ASSIGNED', 'profiles', userId, { new_role: newRole });
      return true;
    } catch {
      return false;
    }
  },

  // 4. Toggle user status (Active / Disabled)
  async toggleUserStatus(userId: string, currentActive: boolean, actorId: string): Promise<boolean> {
    const newStatus = currentActive ? 'disabled' : 'active';
    try {
      await supabase
        .from('profiles')
        .update({
          is_active: !currentActive,
          account_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      await this.logAudit(
        actorId,
        currentActive ? 'USER_DEACTIVATED' : 'USER_REACTIVATED',
        'profiles',
        userId,
        { account_status: newStatus }
      );
      return true;
    } catch {
      return false;
    }
  },

  // 5. Audit Logging
  async logAudit(actorId: string, action: string, entity: string, entityId?: string, metadata: any = {}) {
    try {
      await supabase.from('audit_logs').insert([
        {
          actor_id: actorId,
          action,
          entity,
          entity_id: entityId,
          metadata,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // ignore
    }
  },

  // 6. Fetch audit logs
  async getAuditLogs(limit: number = 20): Promise<AuditLogItem[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as AuditLogItem[];
      }
    } catch {
      // Fallback
    }
    return [];
  },
};
