export interface MonitoringConfig {
  id: number;
  targetUrl: string;
  checkIntervalMs: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface MonitoringLog {
  id: number;
  timestamp: Date;
  url: string;
  statusCode: number | null;
  success: boolean;
  message: string;
  responseTime: number | null;
}

export interface LogStats {
  totalRequests: number;
  successCount: number;
}
