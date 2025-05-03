import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MonitoringConfig, MonitoringLog, LogStats } from '@/lib/types';

export function useWebsiteMonitor() {
  const queryClient = useQueryClient();
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  
  // Fetch config
  const configQuery = useQuery<MonitoringConfig>({
    queryKey: ['/api/config'],
  });
  
  // Fetch logs
  const logsQuery = useQuery<MonitoringLog[]>({
    queryKey: ['/api/logs'],
  });
  
  // Fetch log stats
  const statsQuery = useQuery<LogStats>({
    queryKey: ['/api/logs/stats'],
  });

  // Toggle monitor active state
  const toggleMonitorMutation = useMutation({
    mutationFn: (isActive: boolean) => 
      apiRequest('POST', '/api/monitor/toggle', { isActive })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
      updateNextCheckTime();
    },
  });

  // Clear logs
  const clearLogsMutation = useMutation({
    mutationFn: () => 
      apiRequest('DELETE', '/api/logs')
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs/stats'] });
    },
  });
  
  // Manual check
  const manualCheckMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/monitor/check')
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/logs/stats'] });
      updateNextCheckTime();
    },
  });

  // Update the next check time
  const updateNextCheckTime = useCallback(() => {
    if (configQuery.data?.isActive) {
      const now = new Date();
      const nextCheck = new Date(now.getTime() + (configQuery.data.checkIntervalMs || 300000));
      setNextCheckTime(nextCheck);
    } else {
      setNextCheckTime(null);
    }
  }, [configQuery.data]);

  // Update next check time whenever config changes or when the component mounts
  useEffect(() => {
    updateNextCheckTime();
  }, [configQuery.data, updateNextCheckTime]);

  // Format for display purposes
  const formattedNextCheckTime = nextCheckTime 
    ? nextCheckTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Paused';

  const formattedCheckInterval = configQuery.data
    ? `${Math.floor(configQuery.data.checkIntervalMs / 60000)} minutes`
    : '5 minutes';

  const successRate = statsQuery.data
    ? ((statsQuery.data.successCount / Math.max(statsQuery.data.totalRequests, 1)) * 100).toFixed(1)
    : '0.0';
    
  const successRateFormatted = `${successRate}% (${statsQuery.data?.successCount || 0}/${statsQuery.data?.totalRequests || 0})`;

  return {
    // Queries
    config: configQuery.data,
    logs: logsQuery.data || [],
    stats: statsQuery.data,
    isLoadingConfig: configQuery.isLoading,
    isLoadingLogs: logsQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    // Mutations
    toggleMonitor: toggleMonitorMutation.mutate,
    clearLogs: clearLogsMutation.mutate,
    manualCheck: manualCheckMutation.mutate,
    isTogglingMonitor: toggleMonitorMutation.isPending,
    isClearingLogs: clearLogsMutation.isPending,
    isCheckingManually: manualCheckMutation.isPending,
    
    // Formatted data
    nextCheckTime,
    formattedNextCheckTime,
    formattedCheckInterval,
    successRate: successRateFormatted,
  };
}
