import { supabase } from '../lib/supabase';
import type { ReportItem } from './reportsService';

export interface RecoveryCase {
  id: string;
  case_number: string;
  match_id?: string;
  report_id?: string;
  claimant_id: string;
  finder_id?: string;
  status: 'OPEN' | 'VERIFIED' | 'HANDOVER_SCHEDULED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  handover_date?: string;
  handover_location: string;
  notes?: string;
  verified_by?: string;
  verified_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  report?: ReportItem;
  claimant?: {
    id: string;
    full_name: string;
    department?: string;
    avatar_url?: string;
  };
  finder?: {
    id: string;
    full_name: string;
    department?: string;
  };
}

export const recoveryService = {
  // 1. Fetch user's recovery cases
  async getUserRecoveryCases(userId: string): Promise<RecoveryCase[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_cases')
        .select('*')
        .or(`claimant_id.eq.${userId},finder_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return await this.enrichCases(data);
      }

      // Check legacy claims
      const { data: claims } = await supabase
        .from('claims')
        .select('*')
        .eq('claimant_id', userId)
        .order('created_at', { ascending: false });

      if (claims && claims.length > 0) {
        return claims.map((c: any) => ({
          id: c.id,
          case_number: `RC-${c.id.substring(0, 8).toUpperCase()}`,
          claimant_id: c.claimant_id,
          report_id: c.item_id,
          status: c.status === 'approved' ? 'VERIFIED' : c.status === 'rejected' ? 'REJECTED' : 'OPEN',
          handover_location: 'SVCE Tirupati Campus Security & Student Affairs Desk',
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
      }
    } catch (err) {
      console.error('Error fetching user recovery cases:', err);
    }
    return [];
  },

  // 2. Fetch all recovery cases for Admin
  async getAdminRecoveryCases(): Promise<RecoveryCase[]> {
    try {
      const { data, error } = await supabase
        .from('recovery_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return await this.enrichCases(data);
      }

      // Fallback to claims if recovery_cases empty
      const { data: claims } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (claims && claims.length > 0) {
        return claims.map((c: any) => ({
          id: c.id,
          case_number: `RC-${c.id.substring(0, 8).toUpperCase()}`,
          claimant_id: c.claimant_id,
          report_id: c.item_id,
          status: c.status === 'approved' ? 'VERIFIED' : c.status === 'rejected' ? 'REJECTED' : 'OPEN',
          handover_location: 'SVCE Tirupati Campus Security & Student Affairs Desk',
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
      }
    } catch (err) {
      console.error('Error fetching admin recovery cases:', err);
    }
    return [];
  },

  async enrichCases(cases: any[]): Promise<RecoveryCase[]> {
    return Promise.all(
      cases.map(async (c: any) => {
        let report: ReportItem | undefined;
        if (c.report_id) {
          const { data: rep } = await supabase
            .from('reports')
            .select('*')
            .eq('id', c.report_id)
            .maybeSingle();
          if (rep) report = rep;
        }

        const { data: claimant } = await supabase
          .from('profiles')
          .select('id, full_name, department, avatar_url')
          .eq('id', c.claimant_id)
          .maybeSingle();

        const { data: finder } = c.finder_id
          ? await supabase
              .from('profiles')
              .select('id, full_name, department')
              .eq('id', c.finder_id)
              .maybeSingle()
          : { data: null };

        return {
          ...c,
          report,
          claimant: claimant || { id: c.claimant_id, full_name: 'Campus Claimant' },
          finder: finder || undefined,
        };
      })
    );
  },

  // 3. Admin: Verify case
  async verifyCase(caseId: string, adminId: string, notes?: string): Promise<boolean> {
    try {
      await supabase
        .from('recovery_cases')
        .update({
          status: 'VERIFIED',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          notes: notes || 'Identity verified by SVCE security moderator',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      await supabase.from('audit_logs').insert([
        {
          actor_id: adminId,
          action: 'RECOVERY_VERIFIED',
          entity: 'recovery_cases',
          entity_id: caseId,
          metadata: { verified_by: adminId, notes },
        },
      ]);
      return true;
    } catch {
      return false;
    }
  },

  // 4. Admin: Schedule handover
  async scheduleHandover(
    caseId: string,
    adminId: string,
    handoverDate: string,
    handoverLocation: string = 'SVCE Tirupati Campus Security & Student Affairs Desk'
  ): Promise<boolean> {
    try {
      await supabase
        .from('recovery_cases')
        .update({
          status: 'HANDOVER_SCHEDULED',
          handover_date: handoverDate,
          handover_location: handoverLocation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      await supabase.from('audit_logs').insert([
        {
          actor_id: adminId,
          action: 'HANDOVER_SCHEDULED',
          entity: 'recovery_cases',
          entity_id: caseId,
          metadata: { handover_date: handoverDate, handover_location: handoverLocation },
        },
      ]);
      return true;
    } catch {
      return false;
    }
  },

  // 5. Admin: Complete recovery
  async completeRecovery(caseId: string, adminId: string, notes?: string): Promise<boolean> {
    try {
      const { data: currentCase } = await supabase
        .from('recovery_cases')
        .select('report_id')
        .eq('id', caseId)
        .single();

      await supabase
        .from('recovery_cases')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          notes: notes || 'Item successfully handed over to verified owner',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      // If report exists, update its status to RECOVERED
      if (currentCase?.report_id) {
        await supabase
          .from('reports')
          .update({ status: 'RECOVERED', updated_at: new Date().toISOString() })
          .eq('id', currentCase.report_id);
      }

      await supabase.from('audit_logs').insert([
        {
          actor_id: adminId,
          action: 'RECOVERY_COMPLETED',
          entity: 'recovery_cases',
          entity_id: caseId,
          metadata: { completed_by: adminId, notes },
        },
      ]);
      return true;
    } catch {
      return false;
    }
  },

  // 6. Admin / User: Reject or cancel case
  async cancelCase(caseId: string, actorId: string, reason: string): Promise<boolean> {
    try {
      await supabase
        .from('recovery_cases')
        .update({
          status: 'REJECTED',
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      await supabase.from('audit_logs').insert([
        {
          actor_id: actorId,
          action: 'RECOVERY_REJECTED',
          entity: 'recovery_cases',
          entity_id: caseId,
          metadata: { reason },
        },
      ]);
      return true;
    } catch {
      return false;
    }
  },
};
