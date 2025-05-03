import React from 'react';
import { Header } from '@/components/Header';
import { StatusCard } from '@/components/StatusCard';
import { LogPanel } from '@/components/LogPanel';
import { useWebsiteMonitor } from '@/hooks/useWebsiteMonitor';

export default function Home() {
  const {
    config,
    logs,
    stats,
    isLoadingConfig,
    isLoadingLogs,
    isLoadingStats,
    toggleMonitor,
    clearLogs,
    formattedNextCheckTime,
    formattedCheckInterval,
    successRate,
    isTogglingMonitor,
    isClearingLogs
  } = useWebsiteMonitor();

  return (
    <div className="bg-dark text-light font-sans min-h-screen">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Header version="v1.0.0" />
        
        <StatusCard
          config={config}
          isActive={config?.isActive || false}
          onToggle={toggleMonitor}
          statusCode={logs[0]?.statusCode}
          nextCheckTime={formattedNextCheckTime}
          checkInterval={formattedCheckInterval}
          isLoading={isLoadingConfig || isTogglingMonitor}
        />
        
        <LogPanel
          logs={logs}
          onClearLogs={clearLogs}
          successRate={successRate}
          totalRequests={stats?.totalRequests || 0}
          isClearingLogs={isClearingLogs}
        />
        
        <footer className="mt-8 text-center text-xs text-gray-500">
          <p>Website Monitor • React.js Application</p>
          <p className="mt-1">Environment: <span className="text-primary">{import.meta.env.MODE || 'Development'}</span></p>
        </footer>
      </div>
    </div>
  );
}
