export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  framework: string | null;
  devCommand: string | null;
  installCommand: string | null;
  buildCommand: string | null;
  outputDirectory: string | null;
  publicSource: boolean;
  latestDeployments?: VercelDeployment[];
  targets?: {
    production?: {
      id: string;
      url: string;
    };
  };
  link?: {
    type: string;
    repo: string;
    repoId: number;
    gitCredentialId: string;
    productionBranch: string;
  };
}

export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  type: 'LAMBDAS';
  creator: {
    uid: string;
    email?: string;
    username?: string;
  };
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
  };
  target?: string | null;
  alias?: string[];
  aliasAssigned?: number;
  aliasError?: any;
}

export interface VercelDomain {
  id: string;
  name: string;
  serviceType: string;
  nsVerifiedAt: number | null;
  txtVerifiedAt: number | null;
  cdnEnabled: boolean;
  createdAt: number;
  expiresAt: number | null;
  boughtAt: number | null;
  verified: boolean;
  teamId?: string;
}

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
  createdAt: number;
  avatar: string | null;
}

export interface VercelEnvVariable {
  id: string;
  key: string;
  value: string;
  type: 'plain' | 'secret' | 'encrypted' | 'system';
  target: ('production' | 'preview' | 'development')[];
  gitBranch?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeploymentAnalytics {
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
}

export interface PaginationResponse {
  count: number;
  next: number | null;
  prev: number | null;
}

export interface ApiResponse<T> {
  data?: T;
  pagination?: PaginationResponse;
  error?: {
    code: string;
    message: string;
  };
}

// Account Usage (high-level shape; fields are optional depending on plan/features)
export interface VercelUsagePeriod {
  start?: number;
  end?: number;
}

export interface VercelBandwidthUsage {
  used?: number; // bytes
  included?: number; // bytes included in plan
}

export interface VercelFunctionUsage {
  executions?: number; // total invocations
  durationMs?: number; // total compute duration in ms
}

export interface VercelBuildUsage {
  minutesUsed?: number;
  includedMinutes?: number;
}

export interface VercelStorageUsage {
  used?: number; // bytes
  included?: number; // bytes
}

export interface VercelUsage {
  period?: VercelUsagePeriod;
  bandwidth?: VercelBandwidthUsage;
  serverlessFunctions?: VercelFunctionUsage;
  edgeFunctions?: VercelFunctionUsage;
  build?: VercelBuildUsage;
  storage?: VercelStorageUsage;
  // Unknown additional metrics from API are allowed
  [key: string]: any;
}

export interface DNSRecord {
  id: string;
  slug: string;
  name: string;
  type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'SRV' | 'TXT' | 'NS';
  value: string;
  mxPriority?: number;
  priority?: number;
  ttl?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DeploymentAlias {
  uid: string;
  alias: string;
  createdAt: number;
  deployment: {
    id: string;
    url: string;
  };
}

export interface RuntimeLog {
  timestamp: number;
  message: string;
  source: 'stdout' | 'stderr' | 'static' | 'lambda' | 'external';
  type?: 'info' | 'warn' | 'error';
  requestId?: string;
}

export interface BuildEvent {
  type: string;
  payload: any;
  createdAt: number;
}

