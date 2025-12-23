export type UserRole = 'admin' | 'finance_officer' | 'urban_planner' | 'hr_manager' | 'clerk' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  password: string;
  status: string;
  // Legacy field for backward compatibility
  role?: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Citizen {
  id: string;
  user_id: string;
  national_id: string;
  address: string;
  contact: string;
  date_of_birth: string;
}
export type RequestProjectStatus = 'cancelled' | 'in_progress'| 'on_hold' | 'completed' |'planned';
export type RequestStatus = 'pending' | 'in_progress'| 'rejected' | 'completed';
export type RequestPermitStatus = 'pending' | 'expired'| 'rejected' | 'approved';
export type RequestTaskStatus = 'in_review' | 'in_progress'| 'blocked' | 'completed'|'todo';
export type PermitType = 'business' | 'construction' | 'vehicle' | 'event';
export type RequestType = 'residency' | 'birth' | 'death' | 'marriage' | 'garbage' | 'street_repair' | 'complaint';

export interface CitizenRequest {
  id: string;
  citizen_id: string;
  type: RequestType;
  status: RequestStatus;
  submission_date: string;
  completion_date?: string;
  description?: string;
  // Display fields (from joins)
  citizenName?: string;
  assignedTo?: string;
}
export interface ProfileCitzen {
  id: string;
  user_id:string;
  name:string;
  email:string;
  role:string;
  national_id: string;
  type: RequestType;
  address:string;
  contact:string;
  date_of_birth:string;
  status: string;
  created_at:string;
  updated_at:string;
  
  
}

export interface Permit {
  id: string;
  type: PermitType;
  applicant_id: string;
  status: RequestStatus;
  issue_date: string;
  expiry_date?: string;
  related_documents?: string[];
  // Display fields (from joins)
  citizenName?: string;
  description?: string;
  fee?: number;
}

export interface Payment {
  id: string;
  citizen_id: string;
  amount: number;
  payment_type: 'property_tax' | 'water' | 'electricity' | 'waste';
  date: string;
  status: 'pending' | 'paid' | 'overdue';
  // Display fields (from joins)
  citizenName?: string;
  receiptNumber?: string;
}

export interface Project {
  id: string;
  name: string;
  department_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  // Display fields
  description?: string;
  manager?: string;
  progress?: number;
  spent?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  assignee_id: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  start_date: string;
  end_date: string;
  // Display fields
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assigneeName?: string;
}

export interface Employee {
  id: string;
  user_id: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  name: string;
  email: string;
  contact: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  hours_worked?: number;
  // Display fields
  employeeName?: string;
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
}

export interface Leave {
  id: string;
  employee_id: string;
  type: 'sick' | 'vacation' | 'personal' | 'emergency';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  days: number;
  // Display fields
  employeeName?: string;
}

export type EventAudience = 'public' | 'citizen' | 'finance' | 'hr_manager' | 'project_manager' | 'clerk' | 'all_employees';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  target_audience: EventAudience;
  // Display fields
  location?: string;
  organizer?: string;
  capacity?: number;
  registered?: number;
  type?: 'public' | 'official' | 'cultural' | 'sports' | 'internal';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Document {
  id: string;
  title: string;
  link: string;
  uploaded_by: string;
  related_entity?: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: string;
  data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}