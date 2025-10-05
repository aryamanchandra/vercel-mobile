import axios, { AxiosInstance } from 'axios';
import type {
  VercelProject,
  VercelDeployment,
  VercelDomain,
  VercelTeam,
  VercelEnvVariable,
  PaginationResponse,
  VercelUsage,
} from '../types';

const BASE_URL = 'https://api.vercel.com';

export class VercelAPI {
  private client: AxiosInstance;

  constructor(token: string, teamId?: string) {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: teamId ? { teamId } : {},
    });
  }

  // Projects
  async getProjects(limit = 20, until?: number) {
    const params: any = { limit };
    if (until) params.until = until;
    
    const response = await this.client.get<{
      projects: VercelProject[];
      pagination: PaginationResponse;
    }>('/v9/projects', { params });
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.client.get<VercelProject>(`/v9/projects/${projectId}`);
    return response.data;
  }

  async deleteProject(projectId: string) {
    const response = await this.client.delete(`/v9/projects/${projectId}`);
    return response.data;
  }

  // Deployments
  async getDeployments(limit = 20, until?: number, projectId?: string) {
    const params: any = { limit };
    if (until) params.until = until;
    if (projectId) params.projectId = projectId;
    
    const response = await this.client.get<{
      deployments: VercelDeployment[];
      pagination: PaginationResponse;
    }>('/v6/deployments', { params });
    return response.data;
  }

  async getDeployment(deploymentId: string) {
    const response = await this.client.get<VercelDeployment>(`/v13/deployments/${deploymentId}`);
    return response.data;
  }

  async cancelDeployment(deploymentId: string) {
    const response = await this.client.patch(`/v12/deployments/${deploymentId}/cancel`);
    return response.data;
  }

  async deleteDeployment(deploymentId: string) {
    const response = await this.client.delete(`/v13/deployments/${deploymentId}`);
    return response.data;
  }

  // Domains
  async getDomains(limit = 20, until?: number) {
    const params: any = { limit };
    if (until) params.until = until;
    
    const response = await this.client.get<{
      domains: VercelDomain[];
      pagination: PaginationResponse;
    }>('/v5/domains', { params });
    return response.data;
  }

  async addDomain(name: string, projectId?: string) {
    const response = await this.client.post('/v10/domains', { name, projectId });
    return response.data;
  }

  async removeDomain(domain: string) {
    const response = await this.client.delete(`/v6/domains/${domain}`);
    return response.data;
  }

  // Environment Variables
  async getEnvVariables(projectId: string) {
    const response = await this.client.get<{ envs: VercelEnvVariable[] }>(
      `/v9/projects/${projectId}/env`
    );
    return response.data;
  }

  async createEnvVariable(
    projectId: string,
    key: string,
    value: string,
    target: ('production' | 'preview' | 'development')[],
    type: 'plain' | 'secret' | 'encrypted' = 'encrypted'
  ) {
    const response = await this.client.post(`/v10/projects/${projectId}/env`, {
      key,
      value,
      target,
      type,
    });
    return response.data;
  }

  async deleteEnvVariable(projectId: string, envId: string) {
    const response = await this.client.delete(`/v9/projects/${projectId}/env/${envId}`);
    return response.data;
  }

  // Teams
  async getTeams() {
    const response = await this.client.get<{ teams: VercelTeam[] }>('/v2/teams');
    return response.data;
  }

  // User
  async getCurrentUser() {
    const response = await this.client.get('/v2/user');
    return response.data;
  }

  // Logs
  async getDeploymentLogs(deploymentId: string) {
    const response = await this.client.get(`/v2/deployments/${deploymentId}/events`);
    return response.data;
  }

  async getRuntimeLogs(projectId: string, deploymentId: string) {
    const response = await this.client.get(
      `/v3/projects/${projectId}/deployments/${deploymentId}/runtime-logs`
    );
    return response.data;
  }

  // Aliases (Promote to Production)
  async getDeploymentAliases(deploymentId: string) {
    const response = await this.client.get(`/v2/deployments/${deploymentId}/aliases`);
    return response.data;
  }

  async assignAlias(deploymentId: string, alias: string) {
    const response = await this.client.post(`/v2/deployments/${deploymentId}/aliases`, {
      alias,
    });
    return response.data;
  }

  async promoteToProduction(deploymentId: string, productionDomain: string) {
    return this.assignAlias(deploymentId, productionDomain);
  }

  // DNS Records
  async getDNSRecords(domain: string) {
    const response = await this.client.get(`/v4/domains/${domain}/records`);
    return response.data;
  }

  async createDNSRecord(
    domain: string,
    record: {
      name: string;
      type: string;
      value: string;
      ttl?: number;
    }
  ) {
    const response = await this.client.post(`/v2/domains/${domain}/records`, record);
    return response.data;
  }

  async updateDNSRecord(domain: string, recordId: string, data: any) {
    const response = await this.client.patch(`/v1/domains/${domain}/records/${recordId}`, data);
    return response.data;
  }

  async deleteDNSRecord(domain: string, recordId: string) {
    const response = await this.client.delete(`/v2/domains/${domain}/records/${recordId}`);
    return response.data;
  }

  // Redeploy
  /**
   * Attempts to redeploy a previous deployment.
   * First tries the dedicated redeploy endpoint, then falls back to create-deployment with deploymentId.
   */
  async redeployDeployment(
    deploymentId: string,
    project?: string,
    target: 'production' | 'preview' | 'development' = 'production',
    name?: string
  ) {
    // Redeploy via create-deployment (documented) – requires `name`
    const normalizedTarget: 'production' | 'preview' = target === 'production' ? 'production' : 'preview';
    const body: any = {
      deploymentId,
      target: normalizedTarget,
    };
    if (project) body.project = project; // allow API to disambiguate
    if (name) body.name = name; // required by API if not inferrable

    console.debug('[VercelAPI][redeploy] create start', body);
    try {
      const res = await this.client.post('/v13/deployments', body);
      console.debug('[VercelAPI][redeploy] create success', { id: deploymentId });
      return res.data;
    } catch (err: any) {
      const errMeta = {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      };
      console.error('[VercelAPI][redeploy] create failed', errMeta);
      throw new Error(
        `Redeploy failed (${errMeta.status || 'unknown'}): ${errMeta.data?.error?.message || errMeta.message || 'Unknown error'}`
      );
    }
  }

  // Analytics
  async getProjectAnalytics(projectId: string) {
    const response = await this.client.get(`/v1/analytics/${projectId}`);
    return response.data;
  }

  // Account Usage (Vercel Docs: Usage API)
  async getAccountUsage(params?: { from?: number; to?: number }) {
    const response = await this.client.get<VercelUsage>(`/v4/usage`, {
      params: params || {},
    });
    return response.data;
  }
}

