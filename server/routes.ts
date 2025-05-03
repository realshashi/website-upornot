import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { websiteMonitor } from "./monitor";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get configuration
  app.get('/api/config', async (req, res) => {
    try {
      const config = await storage.getConfig();
      
      if (!config) {
        return res.status(404).json({ message: 'Configuration not found' });
      }
      
      res.json(config);
    } catch (error) {
      console.error('Error retrieving configuration:', error);
      res.status(500).json({ message: 'Failed to retrieve configuration' });
    }
  });

  // Update configuration
  app.post('/api/config', async (req, res) => {
    try {
      const configSchema = z.object({
        targetUrl: z.string().url().optional(),
        checkIntervalMs: z.number().min(60000).optional(), // Minimum 1 minute
        isActive: z.boolean().optional(),
      });
      
      const validatedData = configSchema.parse(req.body);
      
      await websiteMonitor.updateConfig(
        validatedData.targetUrl,
        validatedData.checkIntervalMs,
        validatedData.isActive
      );
      
      const updatedConfig = await storage.getConfig();
      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid configuration data', errors: error.errors });
      }
      
      console.error('Error updating configuration:', error);
      res.status(500).json({ message: 'Failed to update configuration' });
    }
  });

  // Toggle monitor active state
  app.post('/api/monitor/toggle', async (req, res) => {
    try {
      const schema = z.object({
        isActive: z.boolean(),
      });
      
      const { isActive } = schema.parse(req.body);
      
      await websiteMonitor.updateConfig(undefined, undefined, isActive);
      const config = await storage.getConfig();
      
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      
      console.error('Error toggling monitor:', error);
      res.status(500).json({ message: 'Failed to toggle monitor state' });
    }
  });

  // Manually trigger website check
  app.post('/api/monitor/check', async (req, res) => {
    try {
      const result = await websiteMonitor.checkWebsite();
      res.json(result);
    } catch (error) {
      console.error('Error checking website:', error);
      res.status(500).json({ message: 'Failed to check website' });
    }
  });

  // Get logs
  app.get('/api/logs', async (req, res) => {
    try {
      const limitParam = req.query.limit;
      const limit = limitParam ? parseInt(limitParam as string, 10) : undefined;
      
      const logs = await storage.getLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error('Error retrieving logs:', error);
      res.status(500).json({ message: 'Failed to retrieve logs' });
    }
  });

  // Clear logs
  app.delete('/api/logs', async (req, res) => {
    try {
      await storage.clearLogs();
      res.json({ message: 'Logs cleared successfully' });
    } catch (error) {
      console.error('Error clearing logs:', error);
      res.status(500).json({ message: 'Failed to clear logs' });
    }
  });

  // Get log statistics
  app.get('/api/logs/stats', async (req, res) => {
    try {
      const stats = await storage.getLogStats();
      res.json(stats);
    } catch (error) {
      console.error('Error retrieving log statistics:', error);
      res.status(500).json({ message: 'Failed to retrieve log statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
