import { supabase } from '../lib/supabase';

export interface ReportItem {
  id: string;
  reporter_id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  identifying_features?: string;
  campus_location_id?: string;
  location_description?: string;
  building?: string;
  floor?: string;
  room_area?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  time?: string;
  image_url?: string;
  images?: string[];
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'MATCHED' | 'RECOVERED' | 'WITHDRAWN' | 'REJECTED';
  contact_method?: string;
  contact_info?: string;
  created_at: string;
  updated_at?: string;
  reporter?: {
    id: string;
    full_name?: string;
    username?: string;
    department?: string;
    avatar_url?: string;
  };
}

export interface ReportFilters {
  type?: 'LOST' | 'FOUND' | 'ALL';
  category?: string;
  building?: string;
  search?: string;
  dateRange?: string; // 'all', 'today', 'week', 'month'
  status?: string;
  sortBy?: 'recent' | 'relevance';
}

export const reportsService = {
  // 1. Fetch reports with filters
  async getReports(filters: ReportFilters = {}): Promise<ReportItem[]> {
    try {
      // First try reports table
      let query = supabase.from('reports').select('*');

      if (filters.type && filters.type !== 'ALL') {
        query = query.ilike('type', filters.type);
      }
      if (filters.category && filters.category !== 'All Categories') {
        query = query.eq('category', filters.category);
      }
      if (filters.building && filters.building !== 'All Buildings') {
        query = query.eq('building', filters.building);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          ...r,
          type: (r.type || 'LOST').toUpperCase(),
          status: (r.status || 'ACTIVE').toUpperCase(),
        }));
      }

      // If reports table is empty, check legacy items table
      let itemQuery = supabase.from('items').select('*');
      if (filters.type && filters.type !== 'ALL') {
        itemQuery = itemQuery.ilike('type', filters.type);
      }
      if (filters.category && filters.category !== 'All Categories') {
        itemQuery = itemQuery.eq('category', filters.category);
      }
      if (filters.search) {
        itemQuery = itemQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      itemQuery = itemQuery.order('created_at', { ascending: false });
      const { data: itemsData, error: itemErr } = await itemQuery;

      if (!itemErr && itemsData && itemsData.length > 0) {
        return itemsData.map((it: any) => ({
          id: it.id,
          reporter_id: it.user_id,
          type: (it.type || 'lost').toUpperCase() as 'LOST' | 'FOUND',
          title: it.title,
          description: it.description,
          category: it.category,
          brand: it.brand,
          color: it.color,
          identifying_features: it.identifying_features,
          building: it.building,
          floor: it.floor,
          room_area: it.room_area,
          location_description: it.location,
          date: it.date,
          time: it.time,
          image_url: it.image_url,
          status: (it.status || 'ACTIVE').toUpperCase() as any,
          created_at: it.created_at,
          updated_at: it.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Error fetching reports from Supabase:', err);
    }
    return [];
  },

  // 2. Fetch single report by ID
  async getReportById(id: string): Promise<ReportItem | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        // Fetch reporter profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, username, department, avatar_url')
          .eq('id', data.reporter_id)
          .maybeSingle();

        // Fetch additional report images if any
        const { data: images } = await supabase
          .from('report_images')
          .select('image_url')
          .eq('report_id', data.id);

        return {
          ...data,
          type: (data.type || 'LOST').toUpperCase(),
          status: (data.status || 'ACTIVE').toUpperCase(),
          reporter: profile || undefined,
          images: images ? images.map((i: any) => i.image_url) : [data.image_url].filter(Boolean),
        };
      }

      // Legacy fallback
      const { data: legacyItem } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (legacyItem) {
        return {
          id: legacyItem.id,
          reporter_id: legacyItem.user_id,
          type: (legacyItem.type || 'lost').toUpperCase() as 'LOST' | 'FOUND',
          title: legacyItem.title,
          description: legacyItem.description,
          category: legacyItem.category,
          brand: legacyItem.brand,
          color: legacyItem.color,
          identifying_features: legacyItem.identifying_features,
          building: legacyItem.building,
          floor: legacyItem.floor,
          room_area: legacyItem.room_area,
          location_description: legacyItem.location,
          date: legacyItem.date,
          time: legacyItem.time,
          image_url: legacyItem.image_url,
          status: (legacyItem.status || 'ACTIVE').toUpperCase() as any,
          created_at: legacyItem.created_at,
          images: [legacyItem.image_url].filter(Boolean),
        };
      }
    } catch (err) {
      console.error('Error fetching report by ID:', err);
    }
    return null;
  },

  // 3. Create new report (with Supabase Storage upload)
  async createReport(
    reportData: Partial<ReportItem>,
    imageFile?: File
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      let uploadedImageUrl = reportData.image_url || '';

      // Upload image to Supabase Storage bucket 'report-images'
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(filePath);
          uploadedImageUrl = publicUrlData.publicUrl;
        } else {
          // If storage bucket doesn't exist yet, convert image to base64 data URL
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
          uploadedImageUrl = base64;
        }
      }

      const newRecord = {
        reporter_id: reportData.reporter_id,
        type: reportData.type || 'LOST',
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        brand: reportData.brand,
        color: reportData.color,
        identifying_features: reportData.identifying_features,
        campus_location_id: reportData.campus_location_id,
        location_description: reportData.location_description,
        building: reportData.building,
        floor: reportData.floor,
        room_area: reportData.room_area,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        date: reportData.date || new Date().toISOString().split('T')[0],
        time: reportData.time || new Date().toTimeString().split(' ')[0],
        image_url: uploadedImageUrl,
        status: 'ACTIVE',
      };

      const { data, error } = await supabase
        .from('reports')
        .insert([newRecord])
        .select('id')
        .single();

      if (error) {
        // Also try inserting to legacy items table if reports table had schema conflict
        const legacyRecord = {
          user_id: reportData.reporter_id,
          type: (reportData.type || 'LOST').toLowerCase(),
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          brand: reportData.brand,
          color: reportData.color,
          identifying_features: reportData.identifying_features,
          location: reportData.location_description || reportData.building || 'Campus',
          building: reportData.building,
          floor: reportData.floor,
          room_area: reportData.room_area,
          date: reportData.date || new Date().toISOString().split('T')[0],
          time: reportData.time || '12:00:00',
          image_url: uploadedImageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
          contact_method: 'findly_messaging',
          contact_info: 'Mediated via Findly',
          status: 'open',
        };
        const { data: legData, error: legErr } = await supabase
          .from('items')
          .insert([legacyRecord])
          .select('id')
          .single();

        if (legErr) throw legErr;
        return { success: true, id: legData.id };
      }

      const reportId = data.id;

      // Trigger deterministic matching server-side RPC (non-blocking)
      try {
        await supabase.rpc('run_deterministic_matching_for_report', {
          p_report_id: reportId,
        });
      } catch {
        // Graceful fallback if RPC is not yet created in DB
      }

      return { success: true, id: reportId };
    } catch (err: unknown) {
      console.error('Error creating report:', err);
      const message = err instanceof Error ? err.message : 'Failed to create report.';
      return { success: false, error: message };
    }
  },

  // 4. Current user's reports
  async getMyReports(userId: string): Promise<ReportItem[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          ...r,
          type: (r.type || 'LOST').toUpperCase(),
          status: (r.status || 'ACTIVE').toUpperCase(),
        }));
      }

      // Legacy items
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (items) {
        return items.map((it: any) => ({
          id: it.id,
          reporter_id: it.user_id,
          type: (it.type || 'lost').toUpperCase() as any,
          title: it.title,
          description: it.description,
          category: it.category,
          brand: it.brand,
          color: it.color,
          identifying_features: it.identifying_features,
          building: it.building,
          location_description: it.location,
          date: it.date,
          image_url: it.image_url,
          status: (it.status || 'ACTIVE').toUpperCase() as any,
          created_at: it.created_at,
        }));
      }
    } catch (err) {
      console.error('Error fetching my reports:', err);
    }
    return [];
  },

  // 5. Update report status
  async updateReportStatus(
    reportId: string,
    newStatus: string,
    actorId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus.toUpperCase(), updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) {
        // Fallback to items
        await supabase
          .from('items')
          .update({ status: newStatus.toLowerCase(), updated_at: new Date().toISOString() })
          .eq('id', reportId);
      }

      // Log audit
      try {
        await supabase.from('audit_logs').insert([
          {
            actor_id: actorId,
            action: 'REPORT_STATUS_CHANGED',
            entity: 'reports',
            entity_id: reportId,
            metadata: { new_status: newStatus },
          },
        ]);
      } catch {
        // ignore if audit_logs doesn't exist
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update report';
      return { success: false, error: msg };
    }
  },
};
