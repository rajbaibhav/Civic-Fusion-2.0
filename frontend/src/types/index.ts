// User Types
export type UserRole = "citizen" | "volunteer" | "official" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Project Types
export type ProjectStatus = "planned" | "ongoing" | "completed" | "stalled";

export interface ProgressImage {
  imageUrl: string;
  publicId: string;
  uploadedAt: string;
}

export interface ProgressHistoryEntry {
  progress: number;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  notes?: string;
  images?: ProgressImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  department: string;
  location?: string;
  status: ProjectStatus;
  progress: number;
  progressHistory: ProgressHistoryEntry[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Budget Types
export interface BudgetHistoryEntry {
  allocatedAmount: number;
  spentAmount: number;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  project: {
    _id: string;
    title: string;
    description: string;
  };
  allocatedAmount: number;
  spentAmount: number;
  history: BudgetHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  project: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Issue Types
export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssuePriority = "low" | "medium" | "high";

export interface IssueResponse {
  respondedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  _id: string;
  project: {
    _id: string;
    title: string;
    description: string;
  };
  raisedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  title: string;
  description: string;
  category: string;
  status: IssueStatus;
  priority: IssuePriority;
  responses: IssueResponse[];
  isEscalated: boolean;
  escalatedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  activeIssues: number;
  completedProjects: number;
}

// Filter Types
export interface ProjectFilters {
  status?: ProjectStatus;
  department?: string;
  location?: string;
}

export interface IssueFilters {
  status?: IssueStatus;
  category?: string;
  project?: string;
  priority?: IssuePriority;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  isBlocked?: boolean;
}
