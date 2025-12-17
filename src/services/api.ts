import axios, { AxiosInstance } from 'axios';

class ApiService {
  private client: AxiosInstance;
  private apiKey: string = '';

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
    });

    // Add API key to all requests
    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers['X-API-Key'] = this.apiKey;
      }
      return config;
    });
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getHealth() {
    const { data } = await this.client.get('/health');
    return data;
  }

  async getServicesHealth() {
    const { data } = await this.client.get('/services/health');
    return data.data;
  }

  async getCurrentUser() {
    const { data } = await this.client.get('/me');
    return data.data;
  }

  async getDashboard() {
    const { data } = await this.client.get('/dashboard');
    return data.data;
  }

  async getTokens(params?: { chain?: string; groupId?: string }) {
    const { data } = await this.client.get('/tokens', { params });
    return data.data;
  }

  async getTokenStats(tokenId: string) {
    const { data } = await this.client.get(`/tokens/${tokenId}/stats`);
    return data.data;
  }

  async getTransactions(params?: {
    tokenId?: string;
    chain?: string;
    type?: string;
    limit?: number;
  }) {
    const { data } = await this.client.get('/transactions', { params });
    return data.data;
  }

  async getDailyStats(params?: {
    chain?: string;
    tokenAddress?: string;
    days?: number;
  }) {
    const { data } = await this.client.get('/stats/daily', { params });
    return data.data;
  }

  async getGroups() {
    const { data } = await this.client.get('/groups');
    return data.data;
  }

  // Security Dashboard Endpoints

  async getSecurityOverview(groupId?: string) {
    const { data} = await this.client.get('/security/overview', {
      params: groupId ? { groupId } : undefined,
    });
    return data.data;
  }

  // Spam Control
  async getSpamConfig(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/spam-config`);
    return data.data;
  }

  async updateSpamConfig(groupId: string, updates: any) {
    const { data } = await this.client.put(`/groups/${groupId}/spam-config`, updates);
    return data;
  }

  async getSpamStats(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/spam-stats`);
    return data.data;
  }

  async getSpamViolations(groupId: string, limit = 50) {
    const { data } = await this.client.get(`/groups/${groupId}/spam-violations`, {
      params: { limit },
    });
    return data.data;
  }

  // Anti-Raid
  async getRaidEvents(groupId: string, limit = 20) {
    const { data } = await this.client.get(`/groups/${groupId}/raid-events`, {
      params: { limit },
    });
    return data.data;
  }

  async getRaidStats(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/raid-stats`);
    return data.data;
  }

  async resolveRaidEvent(groupId: string, eventId: string) {
    const { data } = await this.client.post(`/groups/${groupId}/raid-events/${eventId}/resolve`);
    return data;
  }

  async updateRaidThreshold(groupId: string, threshold: number) {
    const { data } = await this.client.put(`/groups/${groupId}/raid-threshold`, { threshold });
    return data;
  }

  // Scam Patterns
  async getScamPatterns(activeOnly = false) {
    const { data } = await this.client.get('/scam-patterns', {
      params: activeOnly ? { active: 'true' } : undefined,
    });
    return data.data;
  }

  async addScamPattern(pattern: {
    pattern: string;
    type: string;
    severity: string;
    description?: string;
  }) {
    const { data } = await this.client.post('/scam-patterns', pattern);
    return data;
  }

  async deleteScamPattern(patternId: string) {
    const { data } = await this.client.delete(`/scam-patterns/${patternId}`);
    return data;
  }

  async toggleScamPattern(patternId: string) {
    const { data } = await this.client.put(`/scam-patterns/${patternId}/toggle`);
    return data;
  }

  async getScamStats() {
    const { data } = await this.client.get('/scam-stats');
    return data.data;
  }

  // Trust Level Management
  async getTrustLevels(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/trust-levels`);
    return data.data;
  }

  async getTrustStats(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/trust-stats`);
    return data.data;
  }

  async promoteTrustLevel(trustLevelId: string) {
    const { data } = await this.client.post(`/trust-levels/${trustLevelId}/promote`);
    return data;
  }

  async demoteTrustLevel(trustLevelId: string) {
    const { data } = await this.client.post(`/trust-levels/${trustLevelId}/demote`);
    return data;
  }

  // Portal Configuration
  async getPortal(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/portal`);
    return data.data;
  }

  async updatePortal(groupId: string, updates: any) {
    const { data } = await this.client.put(`/groups/${groupId}/portal`, updates);
    return data;
  }

  async getPortalButtons(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/portal/buttons`);
    return data.data;
  }

  async addPortalButton(groupId: string, button: { text: string; url: string; order: number }) {
    const { data } = await this.client.post(`/groups/${groupId}/portal/buttons`, button);
    return data;
  }

  async deletePortalButton(buttonId: string) {
    const { data } = await this.client.delete(`/portal/buttons/${buttonId}`);
    return data;
  }

  // Greeting Management
  async getGreeting(groupId: string) {
    const { data } = await this.client.get(`/groups/${groupId}/greeting`);
    return data.data;
  }

  async updateGreeting(groupId: string, message: string, createdBy?: string) {
    const { data } = await this.client.put(`/groups/${groupId}/greeting`, { message, createdBy });
    return data;
  }

  async deleteGreeting(groupId: string) {
    const { data } = await this.client.delete(`/groups/${groupId}/greeting`);
    return data;
  }

  // Security Events
  async getSecurityEvents(groupId: string, limit: number = 50) {
    const { data } = await this.client.get(`/groups/${groupId}/security/events?limit=${limit}`);
    return data.data;
  }

  // System Configuration
  async getConfig() {
    const { data } = await this.client.get('/config');
    return data.data;
  }

  async updateConfig(key: string, value: string, category?: string) {
    const { data } = await this.client.put(`/config/${key}`, { value, category });
    return data;
  }

  async deleteConfig(key: string) {
    const { data } = await this.client.delete(`/config/${key}`);
    return data;
  }

  // Users / RBAC
  async getUsers() {
    const { data } = await this.client.get('/users');
    return data.data;
  }

  async inviteUser(payload: { email: string; role: string }) {
    const { data } = await this.client.post('/users/invite', payload);
    return data.data;
  }

  async updateUserRole(userId: string, role: string) {
    const { data } = await this.client.put(`/users/${userId}/role`, { role });
    return data.data;
  }

  async deleteUser(userId: string) {
    const { data } = await this.client.delete(`/users/${userId}`);
    return data.data;
  }

  // Audit logs
  async getAuditLogs(params?: { action?: string; userRole?: string; username?: string; ipAddress?: string }) {
    const { data } = await this.client.get('/audit/logs', { params });
    return data.data;
  }
}

export const api = new ApiService();
