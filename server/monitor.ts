import axios from 'axios';
import { scheduleJob, Job } from 'node-schedule';
import { storage } from './storage';
import { type InsertMonitoringLog } from '@shared/schema';

class WebsiteMonitor {
  private job: Job | null = null;
  private isRunning = false;
  private targetUrl: string = '';
  private checkIntervalMs: number = 300000; // Default 5 minutes

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const config = await storage.getConfig();
    
    if (config) {
      this.targetUrl = config.targetUrl;
      this.checkIntervalMs = config.checkIntervalMs;
      
      if (config.isActive) {
        this.start();
      }
    }
  }

  public async checkWebsite(): Promise<InsertMonitoringLog> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(this.targetUrl, {
        timeout: 30000, // 30 second timeout
        validateStatus: () => true, // Capture all status codes, not just 2xx
      });
      
      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 400;
      
      const logEntry: InsertMonitoringLog = {
        url: this.targetUrl,
        statusCode: response.status,
        success,
        message: success 
          ? `Request completed successfully in ${responseTime}ms` 
          : `Request failed with status ${response.status}`,
        responseTime,
      };
      
      await storage.createLog(logEntry);
      return logEntry;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      const logEntry: InsertMonitoringLog = {
        url: this.targetUrl,
        statusCode: 0,
        success: false,
        message: `Request failed: ${errorMessage}`,
        responseTime,
      };
      
      await storage.createLog(logEntry);
      return logEntry;
    }
  }

  public async start() {
    if (this.isRunning) return;
    
    // Make an immediate check
    await this.checkWebsite();
    
    // Schedule recurring checks
    // Using node-schedule with interval in milliseconds converted to cron-like format
    const intervalMinutes = Math.floor(this.checkIntervalMs / 60000);
    this.job = scheduleJob(`*/${intervalMinutes} * * * *`, async () => {
      await this.checkWebsite();
    });
    
    this.isRunning = true;
    console.log(`Website monitor started. Checking ${this.targetUrl} every ${intervalMinutes} minutes.`);
  }

  public stop() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
    }
    this.isRunning = false;
    console.log('Website monitor stopped.');
  }

  public async updateConfig(targetUrl?: string, checkIntervalMs?: number, isActive?: boolean) {
    const updateData: Record<string, any> = {};
    
    if (targetUrl !== undefined) {
      this.targetUrl = targetUrl;
      updateData.targetUrl = targetUrl;
    }
    
    if (checkIntervalMs !== undefined) {
      this.checkIntervalMs = checkIntervalMs;
      updateData.checkIntervalMs = checkIntervalMs;
    }
    
    if (isActive !== undefined) {
      if (isActive && !this.isRunning) {
        this.start();
      } else if (!isActive && this.isRunning) {
        this.stop();
      }
      updateData.isActive = isActive;
    }
    
    if (Object.keys(updateData).length > 0) {
      await storage.createOrUpdateConfig(updateData);
    }
    
    // If we're updating the interval and the monitor is running, restart it
    if (checkIntervalMs !== undefined && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      targetUrl: this.targetUrl,
      checkIntervalMs: this.checkIntervalMs
    };
  }
}

export const websiteMonitor = new WebsiteMonitor();
