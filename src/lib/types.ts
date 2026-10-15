export type AppRole = 'admin' | 'management' | 'supervisor';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type CaseStatus = 'Open' | 'On Progress' | 'Pending' | 'Escalated' | 'Closed';

export interface UserProfile {
  id: string;
  full_name: string;
  role: AppRole;
  email?: string;
  password?: string;
}

export interface MasterArea {
  id: string;
  name: string;
  created_at?: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface MasterPic {
  id: string;
  name: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface CaseAttachment {
  id: string;
  case_id: string;
  file_url: string;
  file_name: string;
  file_size_kb?: number;
  mime_type?: string;
  created_at?: string;
}

export interface CaseItem {
  id: string;
  case_id: string;
  date_reported: string;
  category_id?: string;
  category_name?: string;
  case_title: string;
  area_id?: string;
  area_name?: string;
  priority: PriorityLevel;
  pic_id?: string;
  pic_name?: string;
  target_date: string;
  status: CaseStatus;
  progress: number;
  last_update: string;
  remarks: string;
  created_by?: string;
  attachments?: CaseAttachment[];
}

export interface FilterState {
  startDate: string;
  endDate: string;
  project: string;
  area: string;
  category: string;
  status: string;
}
