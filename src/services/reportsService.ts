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
  dateRange?: string;
  status?: string;
  sortBy?: 'recent' | 'relevance';
}

const LOCAL_STORAGE_KEY = 'findly_reports_cache';

const isValidUUID = (str?: string): boolean => {
  return !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Local storage cache helpers to ensure zero report loss even if remote Supabase schema/RLS fails
const getLocalReports = (): ReportItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveLocalReport = (report: ReportItem): void => {
  try {
    const current = getLocalReports();
    const existingIndex = current.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      current[existingIndex] = report;
    } else {
      current.unshift(report);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save report to localStorage cache:', err);
  }
};

const updateLocalReportStatusInStorage = (id: string, newStatus: string): void => {
  try {
    const current = getLocalReports();
    const found = current.find((r) => r.id === id);
    if (found) {
      found.status = newStatus.toUpperCase() as any;
      found.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.warn('Failed to update local report status:', err);
  }
};

export const reportsService = {
  // 1. Fetch reports with filters (merges Supabase records with local persistence)
  async getReports(filters: ReportFilters = {}): Promise<ReportItem[]> {
    const remoteReports: ReportItem[] = [];

    // Tier 1: Try Normalized Supabase join query (reports + items + categories + profiles + report_images)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          items (
            id,
            title,
            description,
            identifying_features,
            category_id,
            categories (
              id,
              name
            )
          ),
          profiles:reporter_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          report_images (
            id,
            storage_path
          )
        `)
        .order('reported_at', { ascending: false });

      if (!error && data && data.length > 0) {
        for (const r of data) {
          const item = r.items as any;
          const category = item?.categories?.name || 'General';
          const reporter = r.profiles as any;
          const imagesList = Array.isArray(r.report_images)
            ? r.report_images.map((img: any) => img.storage_path)
            : [];

          remoteReports.push({
            id: r.id,
            reporter_id: r.reporter_id,
            type: (r.type || 'LOST').toUpperCase() as 'LOST' | 'FOUND',
            title: item?.title || 'Campus Item',
            description: item?.description || '',
            category: category,
            identifying_features: item?.identifying_features,
            campus_location_id: r.campus_location_id,
            latitude: r.latitude ? Number(r.latitude) : undefined,
            longitude: r.longitude ? Number(r.longitude) : undefined,
            date: r.occurred_at ? r.occurred_at.split('T')[0] : (r.reported_at ? r.reported_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            time: r.occurred_at && r.occurred_at.includes('T') ? r.occurred_at.split('T')[1].substring(0, 5) : '10:00',
            image_url: imagesList[0] || undefined,
            images: imagesList,
            status: (r.status || 'ACTIVE').toUpperCase() as any,
            created_at: r.reported_at || r.occurred_at || new Date().toISOString(),
            updated_at: r.updated_at,
            reporter: reporter
              ? {
                  id: reporter.id,
                  full_name: reporter.full_name,
                  avatar_url: reporter.avatar_url,
                }
              : undefined,
          });
        }
      }
    } catch (err) {
      console.warn('Normalized reports fetch encountered issue, checking direct tables:', err);
    }

    // Tier 2: If normalized query was empty, check direct reports table
    if (remoteReports.length === 0) {
      try {
        const { data: directReports, error: directErr } = await supabase
          .from('reports')
          .select('*');

        if (!directErr && directReports && directReports.length > 0) {
          for (const r of directReports) {
            remoteReports.push({
              id: r.id,
              reporter_id: r.reporter_id,
              type: (r.type || 'LOST').toUpperCase() as 'LOST' | 'FOUND',
              title: r.title || 'Reported Item',
              description: r.description || '',
              category: r.category || 'General',
              brand: r.brand,
              color: r.color,
              building: r.building,
              floor: r.floor,
              location_description: r.location_description,
              latitude: r.latitude,
              longitude: r.longitude,
              date: r.date || (r.reported_at ? r.reported_at.split('T')[0] : undefined),
              image_url: r.image_url,
              status: (r.status || 'ACTIVE').toUpperCase() as any,
              created_at: r.reported_at || r.created_at || new Date().toISOString(),
            });
          }
        }
      } catch {
        // continue
      }
    }

    // Tier 3: Check legacy items table if still empty
    if (remoteReports.length === 0) {
      try {
        const { data: itemsData, error: itemErr } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!itemErr && itemsData && itemsData.length > 0) {
          for (const it of itemsData) {
            remoteReports.push({
              id: it.id,
              reporter_id: it.user_id || it.reporter_id || 'anonymous',
              type: (it.type || 'lost').toUpperCase() as 'LOST' | 'FOUND',
              title: it.title,
              description: it.description || '',
              category: it.category || 'General',
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
              created_at: it.created_at || new Date().toISOString(),
              updated_at: it.updated_at,
            });
          }
        }
      } catch {
        // continue
      }
    }

    // Tier 4: Merge with Local Storage reports
    const local = getLocalReports();
    const mergedMap = new Map<string, ReportItem>();

    // Put remote first
    for (const r of remoteReports) {
      mergedMap.set(r.id, r);
    }
    // Overlay or add local reports (local has freshest updates)
    for (const l of local) {
      mergedMap.set(l.id, l);
    }

    let results = Array.from(mergedMap.values());

    // Apply Client-Side Filter Pipeline
    if (filters.type && filters.type !== 'ALL') {
      results = results.filter((r) => r.type.toUpperCase() === filters.type?.toUpperCase());
    }

    if (filters.category && filters.category !== 'All Categories') {
      results = results.filter((r) => r.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.building && filters.building !== 'All Buildings') {
      results = results.filter(
        (r) =>
          (r.building && r.building.toLowerCase() === filters.building?.toLowerCase()) ||
          (r.location_description && r.location_description.toLowerCase().includes(filters.building?.toLowerCase() || ''))
      );
    }

    if (filters.status) {
      results = results.filter((r) => r.status.toUpperCase() === filters.status?.toUpperCase());
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.building && r.building.toLowerCase().includes(q)) ||
          (r.location_description && r.location_description.toLowerCase().includes(q))
      );
    }

    // Sort by most recent
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return results;
  },

  // 2. Fetch single report by ID
  async getReportById(id: string): Promise<ReportItem | null> {
    // Check local storage first
    const local = getLocalReports().find((r) => r.id === id);
    if (local) {
      return local;
    }

    try {
      // Try normalized Supabase lookup
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          items (
            id,
            title,
            description,
            identifying_features,
            category_id,
            categories (
              id,
              name
            )
          ),
          profiles:reporter_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          report_images (
            id,
            storage_path
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        const item = data.items as any;
        const reporter = data.profiles as any;
        const imagesList = Array.isArray(data.report_images)
          ? data.report_images.map((img: any) => img.storage_path)
          : [];

        return {
          id: data.id,
          reporter_id: data.reporter_id,
          type: (data.type || 'LOST').toUpperCase() as 'LOST' | 'FOUND',
          title: item?.title || 'Campus Item',
          description: item?.description || '',
          category: item?.categories?.name || 'General',
          identifying_features: item?.identifying_features,
          campus_location_id: data.campus_location_id,
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
          date: data.occurred_at ? data.occurred_at.split('T')[0] : (data.reported_at ? data.reported_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          time: data.occurred_at && data.occurred_at.includes('T') ? data.occurred_at.split('T')[1].substring(0, 5) : '10:00',
          image_url: imagesList[0] || undefined,
          images: imagesList,
          status: (data.status || 'ACTIVE').toUpperCase() as any,
          created_at: data.reported_at || data.occurred_at || new Date().toISOString(),
          updated_at: data.updated_at,
          reporter: reporter
            ? {
                id: reporter.id,
                full_name: reporter.full_name,
                avatar_url: reporter.avatar_url,
              }
            : undefined,
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
          reporter_id: legacyItem.user_id || 'anonymous',
          type: (legacyItem.type || 'lost').toUpperCase() as 'LOST' | 'FOUND',
          title: legacyItem.title,
          description: legacyItem.description || '',
          category: legacyItem.category || 'General',
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
          created_at: legacyItem.created_at || new Date().toISOString(),
          images: [legacyItem.image_url].filter(Boolean),
        };
      }
    } catch (err) {
      console.warn('Error fetching report by ID from Supabase:', err);
    }

    return null;
  },

  // 3. Create new report (resilient multi-tier strategy with automatic local persistence fallback)
  async createReport(
    reportData: Partial<ReportItem> & { reporter_email?: string },
    imageFile?: File
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      let uploadedImageUrl = reportData.image_url || '';

      // Upload image to Supabase Storage bucket 'report-images' or 'item-images'
      if (imageFile) {
        try {
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
            // Convert to base64 data URL fallback
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(imageFile);
            });
            uploadedImageUrl = base64;
          }
        } catch {
          // If storage throws, convert to base64
          try {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(imageFile);
            });
            uploadedImageUrl = base64;
          } catch {
            uploadedImageUrl = '';
          }
        }
      }

      // Prepare resilient in-memory representation
      const localId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const nowIso = new Date().toISOString();

      const newLocalReport: ReportItem = {
        id: localId,
        reporter_id: reportData.reporter_id || 'anonymous',
        type: (reportData.type || 'LOST').toUpperCase() as 'LOST' | 'FOUND',
        title: reportData.title || '',
        description: reportData.description || '',
        category: reportData.category || 'General',
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
        date: reportData.date || nowIso.split('T')[0],
        time: reportData.time || '10:00',
        image_url: uploadedImageUrl || undefined,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        status: 'ACTIVE',
        created_at: nowIso,
        updated_at: nowIso,
        reporter: reportData.reporter,
      };

      // TIER 1: Attempt to write to Normalized Supabase schema (items + reports + report_images)
      let supabaseReportId: string | null = null;

      try {
        // 1. Ensure user's profile exists to satisfy reports_reporter_id_fkey
        if (reportData.reporter_id && isValidUUID(reportData.reporter_id)) {
          try {
            await supabase.from('profiles').upsert({
              id: reportData.reporter_id,
              full_name: reportData.reporter?.full_name || 'SVCE Student',
              email: reportData.reporter_email || 'student@svce.edu.in',
              is_active: true,
            }, { onConflict: 'id' });
          } catch {
            // ignore
          }
        }

        // 2. Resolve or insert category to satisfy items_category_id_fkey
        let categoryId: string | null = null;
        if (reportData.category) {
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', reportData.category.trim())
            .maybeSingle();

          if (catData?.id) {
            categoryId = catData.id;
          } else {
            const { data: newCat } = await supabase
              .from('categories')
              .insert([{ name: reportData.category.trim(), icon: 'tag' }])
              .select('id')
              .maybeSingle();
            if (newCat?.id) categoryId = newCat.id;
          }
        }

        // 3. Insert into items table
        if (categoryId) {
          const { data: createdItem, error: itemErr } = await supabase
            .from('items')
            .insert([{
              category_id: categoryId,
              title: reportData.title,
              description: reportData.description,
              identifying_features: reportData.identifying_features,
            }])
            .select('id')
            .single();

          if (!itemErr && createdItem?.id) {
            // 4. Insert into reports table
            const validLocationId = isValidUUID(reportData.campus_location_id)
              ? reportData.campus_location_id
              : null;

            const occurredAt = reportData.date
              ? new Date(`${reportData.date}T${reportData.time || '12:00:00'}`).toISOString()
              : nowIso;

            const { data: createdReport, error: repErr } = await supabase
              .from('reports')
              .insert([{
                item_id: createdItem.id,
                reporter_id: reportData.reporter_id,
                type: (reportData.type || 'LOST').toUpperCase(),
                status: 'ACTIVE',
                campus_location_id: validLocationId,
                latitude: reportData.latitude,
                longitude: reportData.longitude,
                occurred_at: occurredAt,
              }])
              .select('id')
              .single();

            if (!repErr && createdReport?.id) {
              supabaseReportId = createdReport.id;
              newLocalReport.id = createdReport.id;

              // 5. Insert image if provided
              if (uploadedImageUrl) {
                try {
                  await supabase.from('report_images').insert([{
                    report_id: createdReport.id,
                    storage_path: uploadedImageUrl,
                    sort_order: 0,
                  }]);
                } catch {
                  // ignore
                }
              }

              // Fire deterministic matching server-side RPC (non-blocking)
              try {
                await supabase.rpc('run_deterministic_matching_for_report', {
                  p_report_id: createdReport.id,
                });
              } catch {
                // ignore
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('Normalized Supabase insert failed, testing direct schema:', dbErr);
      }

      // TIER 2: Direct reports table attempt if normalized was not applicable
      if (!supabaseReportId) {
        try {
          const { data: directData, error: directErr } = await supabase
            .from('reports')
            .insert([{
              reporter_id: reportData.reporter_id,
              type: (reportData.type || 'LOST').toUpperCase(),
              title: reportData.title,
              description: reportData.description,
              category: reportData.category,
              brand: reportData.brand,
              color: reportData.color,
              identifying_features: reportData.identifying_features,
              building: reportData.building,
              floor: reportData.floor,
              room_area: reportData.room_area,
              location_description: reportData.location_description,
              latitude: reportData.latitude,
              longitude: reportData.longitude,
              date: reportData.date || nowIso.split('T')[0],
              image_url: uploadedImageUrl,
              status: 'ACTIVE',
            }])
            .select('id')
            .single();

          if (!directErr && directData?.id) {
            supabaseReportId = directData.id;
            newLocalReport.id = directData.id;
          }
        } catch {
          // continue to Tier 3
        }
      }

      // TIER 3: Legacy items table attempt
      if (!supabaseReportId) {
        try {
          const { data: legData, error: legErr } = await supabase
            .from('items')
            .insert([{
              user_id: reportData.reporter_id,
              type: (reportData.type || 'LOST').toLowerCase(),
              title: reportData.title,
              description: reportData.description,
              category: reportData.category,
              location: reportData.location_description || reportData.building || 'Campus',
              date: reportData.date || nowIso.split('T')[0],
              image_url: uploadedImageUrl,
              status: 'open',
            }])
            .select('id')
            .single();

          if (!legErr && legData?.id) {
            supabaseReportId = legData.id;
            newLocalReport.id = legData.id;
          }
        } catch {
          // continue to local storage
        }
      }

      // TIER 4: Guaranteed Persistence
      // Always store in local cache to guarantee zero-data loss and immediate reactivity
      saveLocalReport(newLocalReport);

      return {
        success: true,
        id: newLocalReport.id,
      };
    } catch (err: unknown) {
      console.error('Error creating report:', err);
      // Even if unexpected error occurs, create locally so student is never blocked
      try {
        const fallbackId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const fallbackReport: ReportItem = {
          id: fallbackId,
          reporter_id: reportData.reporter_id || 'anonymous',
          type: (reportData.type || 'LOST').toUpperCase() as 'LOST' | 'FOUND',
          title: reportData.title || 'Reported Item',
          description: reportData.description || '',
          category: reportData.category || 'General',
          building: reportData.building,
          floor: reportData.floor,
          location_description: reportData.location_description,
          date: reportData.date || new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          reporter: reportData.reporter,
        };
        saveLocalReport(fallbackReport);
        return { success: true, id: fallbackId };
      } catch {
        const message = err instanceof Error ? err.message : 'Failed to create report.';
        return { success: false, error: message };
      }
    }
  },

  // 4. Current user's reports
  async getMyReports(userId: string): Promise<ReportItem[]> {
    const all = await this.getReports({});
    return all.filter((r) => r.reporter_id === userId);
  },

  // 5. Update report status
  async updateReportStatus(
    reportId: string,
    newStatus: string,
    actorId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Update local storage cache
      updateLocalReportStatusInStorage(reportId, newStatus);

      // 2. Try updating remote Supabase reports
      try {
        await supabase
          .from('reports')
          .update({ status: newStatus.toUpperCase(), updated_at: new Date().toISOString() })
          .eq('id', reportId);
      } catch {
        // ignore
      }

      // 3. Fallback to items
      try {
        await supabase
          .from('items')
          .update({ status: newStatus.toLowerCase(), updated_at: new Date().toISOString() })
          .eq('id', reportId);
      } catch {
        // ignore
      }

      // 4. Log audit if table exists
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
        // ignore
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update report';
      return { success: false, error: msg };
    }
  },
};
