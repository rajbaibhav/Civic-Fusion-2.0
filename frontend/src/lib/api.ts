import type {
  AuthResponse,
  Project,
  Budget,
  Comment,
  Issue,
  User,
  PlatformStats,
  ProjectFilters,
  IssueFilters,
  UserFilters,
  ProjectStatus,
  IssueStatus,
  IssuePriority,
  UserRole,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const headers = (includeAuth = true): HeadersInit => {
  const h: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    }
  }
  return h;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await response.json().catch(() => ({ error: "An error occurred" }));
    throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authApi = {
  signup: async (data: { name: string; email: string; password: string; role: "citizen" | "volunteer" }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: headers(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  updateProfile: async (data: { name?: string; password?: string }): Promise<User> => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  deactivate: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/users/deactivate`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Projects API
export const projectsApi = {
  getAll: async (filters?: ProjectFilters): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.location) params.append("location", filters.location);
    
    const response = await fetch(`${API_BASE}/projects?${params}`, {
      headers: headers(false),
    });
    return handleResponse<Project[]>(response);
  },

  getById: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      headers: headers(false),
    });
    return handleResponse<Project>(response);
  },

  create: async (data: { title: string; description: string; department: string; location?: string }): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(response);
  },

  update: async (id: string, data: { title?: string; description?: string; department?: string; location?: string }): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(response);
  },

  updateStatus: async (id: string, status: ProjectStatus): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}/status`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Project>(response);
  },

  updateProgress: async (id: string, data: { progress: number; notes?: string }): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}/progress`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ message: string; project: Project }>(response);
    return result.project;
  },

  updateProgressWithImages: async (
    id: string,
    data: { progress: number; notes?: string },
    images: File[]
  ): Promise<Project> => {
    const formData = new FormData();
    formData.append("progress", String(data.progress));
    if (data.notes) formData.append("notes", data.notes);
    images.forEach((file) => formData.append("images", file));

    const token = getToken();
    const h: HeadersInit = {};
    if (token) h["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/projects/${id}/progress/upload`, {
      method: "PUT",
      headers: h,
      body: formData,
    });
    const result = await handleResponse<{ message: string; project: Project }>(response);
    return result.project;
  },

  archive: async (id: string): Promise<Project> => {
    const response = await fetch(`${API_BASE}/projects/${id}/archive`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<Project>(response);
  },
};

// Budgets API
export const budgetsApi = {
  getByProject: async (projectId: string): Promise<Budget> => {
    const response = await fetch(`${API_BASE}/budgets/project/${projectId}`, {
      headers: headers(false),
    });
    return handleResponse<Budget>(response);
  },

  getHistory: async (projectId: string): Promise<Budget> => {
    const response = await fetch(`${API_BASE}/budgets/project/${projectId}/history`, {
      headers: headers(false),
    });
    return handleResponse<Budget>(response);
  },

  create: async (projectId: string, data: { allocatedAmount: number }): Promise<Budget> => {
    const response = await fetch(`${API_BASE}/budgets/project/${projectId}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(response);
  },

  update: async (projectId: string, data: { allocatedAmount?: number; spentAmount?: number; notes?: string }): Promise<Budget> => {
    const response = await fetch(`${API_BASE}/budgets/project/${projectId}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(response);
  },
};

// Comments API
export const commentsApi = {
  getByProject: async (projectId: string): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE}/comments/project/${projectId}`, {
      headers: headers(false),
    });
    return handleResponse<Comment[]>(response);
  },

  create: async (projectId: string, data: { content: string }): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/comments/project/${projectId}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Comment>(response);
  },

  update: async (id: string, data: { content: string }): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/comments/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Comment>(response);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/comments/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Issues API
export const issuesApi = {
  getAll: async (filters?: IssueFilters): Promise<Issue[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.project) params.append("project", filters.project);
    if (filters?.priority) params.append("priority", filters.priority);

    const response = await fetch(`${API_BASE}/issues?${params}`, {
      headers: headers(false),
    });
    return handleResponse<Issue[]>(response);
  },

  getById: async (id: string): Promise<Issue> => {
    const response = await fetch(`${API_BASE}/issues/${id}`, {
      headers: headers(false),
    });
    return handleResponse<Issue>(response);
  },

  create: async (projectId: string, data: { title: string; description: string; category: string; priority?: IssuePriority }): Promise<Issue> => {
    const response = await fetch(`${API_BASE}/issues/project/${projectId}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Issue>(response);
  },

  updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
    const response = await fetch(`${API_BASE}/issues/${id}/status`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Issue>(response);
  },

  respond: async (id: string, data: { response: string }): Promise<Issue> => {
    const response = await fetch(`${API_BASE}/issues/${id}/respond`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Issue>(response);
  },

  escalate: async (id: string, data: { escalatedTo: string }): Promise<Issue> => {
    const response = await fetch(`${API_BASE}/issues/${id}/escalate`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    });
    return handleResponse<Issue>(response);
  },
};

// Admin API
export const adminApi = {
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
    if (filters?.isBlocked !== undefined) params.append("isBlocked", String(filters.isBlocked));

    const response = await fetch(`${API_BASE}/admin/users?${params}`, {
      headers: headers(),
    });
    return handleResponse<User[]>(response);
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  assignRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ role }),
    });
    return handleResponse<User>(response);
  },

  blockUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}/block`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  unblockUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}/unblock`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  deactivateUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}/deactivate`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  reactivateUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE}/admin/users/${id}/reactivate`, {
      method: "PUT",
      headers: headers(),
    });
    return handleResponse<User>(response);
  },

  deleteComment: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/admin/comments/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    return handleResponse<{ message: string }>(response);
  },

  getStats: async (): Promise<PlatformStats> => {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      headers: headers(),
    });
    return handleResponse<PlatformStats>(response);
  },
};
