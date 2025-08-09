export interface User {
  id: string;
  name: string;
  nationalId: string;
  role: 'member' | 'admin';
  createdAt?: Date;
  // Enhanced profile fields
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  supervisor?: string;
  hireDate?: Date;
  profileImage?: string;
  skills?: string[];
  bio?: string;
  status?: 'active' | 'inactive' | 'on-leave';
}

export interface WorkProgress {
  id: string;
  staffId: string;
  title: string;
  description: string;
  category: 'project' | 'task' | 'training' | 'meeting' | 'other';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  assignedBy?: string;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffPerformance {
  id: string;
  staffId: string;
  period: string; // e.g., "2024-Q1", "2024-01"
  tasksCompleted: number;
  tasksOnTime: number;
  averageRating: number;
  goals: string[];
  achievements: string[];
  areasForImprovement: string[];
  supervisorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  type: 'complaint' | 'suggestion' | 'idea';
  status: 'pending' | 'in-review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  submittedBy: string;
  submittedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  adminNotes?: string;
  // Enhanced fields for manager targeting
  targetManager?: string; // Manager type: operation-manager, hr-manager, area-manager
  category?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (nationalId: string, name: string) => Promise<boolean>;
  logout: () => void;
  register: (nationalId: string, name: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  authToken: string | null;
  refreshToken: () => Promise<boolean>;
}

export interface AppContextType {
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt'>) => Promise<void>;
  updateSubmission: (id: string, updates: Partial<Submission>) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
  loadSubmissions: () => Promise<void>;
  isLoading: boolean;
}