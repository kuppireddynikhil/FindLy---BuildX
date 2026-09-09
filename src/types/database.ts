// Findly Database Types
// These mirror the Supabase/PostgreSQL schema

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'resolved' | 'claimed';
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  title: string;
  description: string | null;
  category: string;
  location: string;
  date: string;
  image_url: string | null;
  contact_info: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

// Category options for items
export const ITEM_CATEGORIES = [
  'Electronics',
  'Books & Notes',
  'Clothing',
  'Accessories',
  'ID Cards & Documents',
  'Keys',
  'Bags & Wallets',
  'Sports Equipment',
  'Water Bottles',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

// Location options (common campus locations)
export const CAMPUS_LOCATIONS = [
  'Library',
  'Cafeteria',
  'Main Building',
  'Science Block',
  'Engineering Block',
  'Arts Building',
  'Sports Complex',
  'Auditorium',
  'Parking Lot',
  'Hostel',
  'Lab',
  'Playground',
  'Bus Stop',
  'Other',
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];
