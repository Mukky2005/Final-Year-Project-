const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const clearAuthToken = () => localStorage.removeItem('token');

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, let browser set Content-Type with boundary
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Expired or invalid token
    clearAuthToken();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getDemoUsers: () => apiRequest('/auth/demo-users'),
  switchUser: (userId) =>
    apiRequest('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  getMe: () => apiRequest('/auth/me'),

  // Tenant & Roles
  getTenant: () => apiRequest('/tenants/current'),
  getRoles: () => apiRequest('/roles'),
  createRole: (roleData) =>
    apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    }),

  // Employees
  getEmployees: () => apiRequest('/employees'),
  createEmployee: (empData) =>
    apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(empData),
    }),
  updateEmployeeRole: (userId, roleId) =>
    apiRequest(`/employees/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role_id: roleId }),
    }),
  toggleEmployeeStatus: (userId) =>
    apiRequest(`/employees/${userId}/status`, {
      method: 'PATCH',
    }),

  // Documents
  getDocuments: () => apiRequest('/documents'),
  uploadDocument: (formData) =>
    apiRequest('/documents/upload', {
      method: 'POST',
      body: formData,
    }),
  deleteDocument: (docId) =>
    apiRequest(`/documents/${docId}`, {
      method: 'DELETE',
    }),

  // Chat & Retrieval
  queryKnowledge: (question, conversationId = null, simulateRoleId = null) =>
    apiRequest('/chat/query', {
      method: 'POST',
      body: JSON.stringify({
        question,
        conversation_id: conversationId,
        simulate_role_id: simulateRoleId,
      }),
    }),
  getConversations: () => apiRequest('/chat/conversations'),
  getConversationDetail: (convId) => apiRequest(`/chat/conversations/${convId}`),
  deleteConversation: (convId) =>
    apiRequest(`/chat/conversations/${convId}`, {
      method: 'DELETE',
    }),

  // Audit
  getAuditEvents: (limit = 50) => apiRequest(`/audit/events?limit=${limit}`),
};

