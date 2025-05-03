import { 
  users, type User, type InsertUser,
  monitoringLogs, type MonitoringLog, type InsertMonitoringLog,
  monitoringConfig, type MonitoringConfig, type InsertMonitoringConfig
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // MonitoringLog methods
  getLogs(limit?: number): Promise<MonitoringLog[]>;
  createLog(log: InsertMonitoringLog): Promise<MonitoringLog>;
  clearLogs(): Promise<void>;
  getLogStats(): Promise<{ totalRequests: number, successCount: number }>;
  
  // MonitoringConfig methods
  getConfig(): Promise<MonitoringConfig | undefined>;
  createOrUpdateConfig(config: Partial<InsertMonitoringConfig>): Promise<MonitoringConfig>;
  toggleMonitorActive(isActive: boolean): Promise<MonitoringConfig>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private logs: Map<number, MonitoringLog>;
  private config: MonitoringConfig | undefined;
  
  private userId: number;
  private logId: number;
  private configId: number;

  constructor() {
    this.users = new Map();
    this.logs = new Map();
    this.userId = 1;
    this.logId = 1;
    this.configId = 1;
    
    // Initialize with default config
    this.config = {
      id: this.configId,
      targetUrl: process.env.TARGET_URL || "https://example.com",
      checkIntervalMs: 300000, // 5 minutes in milliseconds
      isActive: true,
      lastUpdated: new Date(),
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // MonitoringLog methods
  async getLogs(limit?: number): Promise<MonitoringLog[]> {
    const logs = Array.from(this.logs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (limit && limit > 0) {
      return logs.slice(0, limit);
    }
    
    return logs;
  }
  
  async createLog(insertLog: InsertMonitoringLog): Promise<MonitoringLog> {
    const id = this.logId++;
    const log: MonitoringLog = { 
      ...insertLog, 
      id, 
      timestamp: new Date() 
    };
    this.logs.set(id, log);
    return log;
  }
  
  async clearLogs(): Promise<void> {
    this.logs.clear();
  }
  
  async getLogStats(): Promise<{ totalRequests: number, successCount: number }> {
    const logs = Array.from(this.logs.values());
    const totalRequests = logs.length;
    const successCount = logs.filter(log => log.success).length;
    
    return {
      totalRequests,
      successCount
    };
  }
  
  // MonitoringConfig methods
  async getConfig(): Promise<MonitoringConfig | undefined> {
    return this.config;
  }
  
  async createOrUpdateConfig(configData: Partial<InsertMonitoringConfig>): Promise<MonitoringConfig> {
    if (!this.config) {
      this.config = {
        id: this.configId,
        targetUrl: configData.targetUrl || process.env.TARGET_URL || "https://example.com",
        checkIntervalMs: configData.checkIntervalMs || 300000,
        isActive: configData.isActive !== undefined ? configData.isActive : true,
        lastUpdated: new Date(),
      };
    } else {
      if (configData.targetUrl !== undefined) {
        this.config.targetUrl = configData.targetUrl;
      }
      if (configData.checkIntervalMs !== undefined) {
        this.config.checkIntervalMs = configData.checkIntervalMs;
      }
      if (configData.isActive !== undefined) {
        this.config.isActive = configData.isActive;
      }
      this.config.lastUpdated = new Date();
    }
    
    return this.config;
  }
  
  async toggleMonitorActive(isActive: boolean): Promise<MonitoringConfig> {
    if (!this.config) {
      return this.createOrUpdateConfig({ isActive });
    }
    
    this.config.isActive = isActive;
    this.config.lastUpdated = new Date();
    
    return this.config;
  }
}

export const storage = new MemStorage();
