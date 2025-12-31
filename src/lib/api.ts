const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Provide more specific error messages
      if (response.status === 0 || response.status === 500) {
        errorMessage = 'Server connection failed. Please make sure the backend server is running on port 3001.';
      } else if (response.status === 401) {
        errorMessage = errorMessage || 'Invalid email or password';
      } else if (response.status === 403) {
        errorMessage = errorMessage || 'Access denied';
      } else if (response.status === 404) {
        errorMessage = 'API endpoint not found. Please check the server configuration.';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    const result = await this.request<{ user: any; token: string; defaultWorkspace: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    // Token is set by AuthContext, but set it here too for safety
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  // Workspaces
  async getWorkspaces() {
    return this.request<{ workspaces: any[] }>('/workspaces');
  }

  async getWorkspace(id: string) {
    return this.request<{ workspace: any }>(`/workspaces/${id}`);
  }

  async createWorkspace(name: string, description?: string) {
    return this.request<{ workspace: any }>('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async updateWorkspace(id: string, name: string, description?: string) {
    return this.request<{ workspace: any }>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteWorkspace(id: string) {
    return this.request(`/workspaces/${id}`, { method: 'DELETE' });
  }

  // Tasks
  async getTasks(workspaceId: string, filters?: { status?: string; category?: string; priority?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    const query = params.toString();
    return this.request<{ tasks: any[] }>(`/tasks/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  }

  async getTask(id: string) {
    return this.request<{ task: any }>(`/tasks/${id}`);
  }

  async createTask(workspaceId: string, taskData: any) {
    return this.request<{ task: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...taskData, workspaceId }),
    });
  }

  async updateTask(id: string, taskData: any) {
    return this.request<{ task: any }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  async startTimeTracking(taskId: string) {
    return this.request<{ timeEntry: any }>(`/tasks/${taskId}/time/start`, {
      method: 'POST',
    });
  }

  async stopTimeTracking(taskId: string) {
    return this.request<{ timeEntry: any }>(`/tasks/${taskId}/time/stop`, {
      method: 'POST',
    });
  }

  async addTimeEntry(taskId: string, duration: number, description?: string) {
    return this.request<{ timeEntry: any }>(`/tasks/${taskId}/time`, {
      method: 'POST',
      body: JSON.stringify({ duration, description }),
    });
  }

  // Expenses
  async getExpenses(workspaceId: string, filters?: { category?: string; startDate?: string; endDate?: string; currency?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString();
    return this.request<{ expenses: any[] }>(`/expenses/workspace/${workspaceId}${query ? `?${query}` : ''}`);
  }

  async createExpense(workspaceId: string, expenseData: any) {
    return this.request<{ expense: any }>('/expenses', {
      method: 'POST',
      body: JSON.stringify({ ...expenseData, workspaceId }),
    });
  }

  async updateExpense(id: string, expenseData: any) {
    return this.request<{ expense: any }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, { method: 'DELETE' });
  }

  async getBudgets(workspaceId: string) {
    return this.request<{ budgets: any[] }>(`/expenses/workspace/${workspaceId}/budgets`);
  }

  async createBudget(workspaceId: string, budgetData: any) {
    return this.request<{ budget: any }>(`/expenses/workspace/${workspaceId}/budgets`, {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  async updateBudget(id: string, budgetData: any) {
    return this.request<{ budget: any }>(`/expenses/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    });
  }

  async deleteBudget(id: string) {
    return this.request(`/expenses/budgets/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardData(workspaceId: string) {
    return this.request<{
      todayTasks: any[];
      overdueTasks: any[];
      timeSpentToday: number;
      tasksCompletedThisWeek: number;
      monthlyExpenses: number;
      budgetStatus: any[];
      productivityScore: number;
    }>(`/dashboard/workspace/${workspaceId}`);
  }

  // Habits
  async getHabits(workspaceId: string) {
    return this.request<{ habits: any[] }>(`/habits/workspace/${workspaceId}`);
  }

  async createHabit(workspaceId: string, habitData: any) {
    return this.request<{ habit: any }>('/habits', {
      method: 'POST',
      body: JSON.stringify({ ...habitData, workspaceId }),
    });
  }

  async updateHabit(id: string, habitData: any) {
    return this.request<{ habit: any }>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(habitData),
    });
  }

  async deleteHabit(id: string) {
    return this.request(`/habits/${id}`, { method: 'DELETE' });
  }

  async toggleHabitEntry(habitId: string, date?: string, completed?: boolean, notes?: string) {
    return this.request<{ entry: any }>(`/habits/${habitId}/entries`, {
      method: 'POST',
      body: JSON.stringify({ date, completed, notes }),
    });
  }

  // Reports
  async getTaskReport(workspaceId: string, period: string = 'month') {
    return this.request<any>(`/reports/tasks/workspace/${workspaceId}?period=${period}`);
  }

  async getExpenseReport(workspaceId: string, period: string = 'month') {
    return this.request<any>(`/reports/expenses/workspace/${workspaceId}?period=${period}`);
  }

  // Admin routes (Super Admin only)
  async getAdminUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  async getAdminUser(id: string) {
    return this.request<{ user: any }>(`/admin/users/${id}`);
  }

  async createAdminUser(userData: { email: string; password: string; name?: string; role?: string; preferredCurrency?: string }) {
    return this.request<{ user: any }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id: string, userData: { name?: string; role?: string; preferredCurrency?: string; password?: string }) {
    return this.request<{ user: any }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  // User preferences
  async updateUserPreferences(preferences: { preferredCurrency?: string; name?: string }) {
    return this.request<{ user: any }>('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const api = new ApiClient();

