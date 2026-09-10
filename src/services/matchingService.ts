import { supabase } from '../lib/supabase';
import type { ReportItem } from './reportsService';

export interface MatchReason {
  total_score: number;
  keyword_score: number;
  category_score: number;
  location_score: number;
  date_score: number;
  description_score: number;
  explanation: string;
}

export interface MatchRecord {
  id: string;
  lost_report_id: string;
  found_report_id: string;
  score: number;
  status: 'SUGGESTED' | 'CONFIRMED' | 'DISMISSED';
  match_reasons: MatchReason;
  lost_report?: ReportItem;
  found_report?: ReportItem;
  created_at: string;
}

export const matchingService = {
  // Deterministic 100% scoring calculation
  calculateScore(r1: Partial<ReportItem>, r2: Partial<ReportItem>): MatchReason {
    // 1. Keyword similarity (30%)
    const words1 = (r1.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const words2 = (r2.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const intersection = words1.filter((w) => words2.includes(w));
    const totalWords = Math.max(words1.length, words2.length, 1);
    const keywordScore = Math.min(30, Math.round((intersection.length / totalWords) * 30));

    // 2. Category match (20%)
    const cat1 = (r1.category || '').toLowerCase().trim();
    const cat2 = (r2.category || '').toLowerCase().trim();
    const categoryScore = cat1 && cat2 && cat1 === cat2 ? 20 : 0;

    // 3. Location proximity (20%)
    let locationScore = 0;
    if (r1.campus_location_id && r2.campus_location_id && r1.campus_location_id === r2.campus_location_id) {
      locationScore = 20;
    } else if (
      r1.building &&
      r2.building &&
      r1.building.toLowerCase().trim() === r2.building.toLowerCase().trim()
    ) {
      locationScore = 14;
    } else if (r1.latitude && r1.longitude && r2.latitude && r2.longitude) {
      const dist = Math.abs(r1.latitude - r2.latitude) + Math.abs(r1.longitude - r2.longitude);
      if (dist < 0.0015) locationScore = 18;
      else if (dist < 0.005) locationScore = 10;
    }

    // 4. Date proximity (15%)
    let dateScore = 0;
    const d1 = new Date(r1.date || r1.created_at || Date.now()).getTime();
    const d2 = new Date(r2.date || r2.created_at || Date.now()).getTime();
    const diffDays = Math.abs(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) dateScore = 15;
    else if (diffDays <= 2) dateScore = 12;
    else if (diffDays <= 5) dateScore = 9;
    else if (diffDays <= 10) dateScore = 5;

    // 5. Description similarity (15%)
    const descWords1 = (r1.description || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const descWords2 = (r2.description || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const descCommon = descWords1.filter((w) => descWords2.includes(w));
    const descScore = Math.min(15, descCommon.length * 3);

    const totalScore = keywordScore + categoryScore + locationScore + dateScore + descScore;

    const explanation = `Score ${totalScore}%: Keyword match (${keywordScore}/30), Category match (${categoryScore}/20), Location (${locationScore}/20), Date within ${diffDays} days (${dateScore}/15), Description similarity (${descScore}/15).`;

    return {
      total_score: totalScore,
      keyword_score: keywordScore,
      category_score: categoryScore,
      location_score: locationScore,
      date_score: dateScore,
      description_score: descScore,
      explanation,
    };
  },

  async getMatchesForReport(reportId: string): Promise<MatchRecord[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`lost_report_id.eq.${reportId},found_report_id.eq.${reportId}`)
        .order('score', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as MatchRecord[];
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async confirmMatch(matchId: string, actorId: string): Promise<boolean> {
    try {
      await supabase
        .from('matches')
        .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
        .eq('id', matchId);

      // Audit log
      await supabase.from('audit_logs').insert([
        {
          actor_id: actorId,
          action: 'MATCH_CONFIRMED',
          entity: 'matches',
          entity_id: matchId,
          metadata: { confirmed_by: actorId },
        },
      ]);
      return true;
    } catch {
      return false;
    }
  },
};
