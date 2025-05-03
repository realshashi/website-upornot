import React from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { MonitoringConfig } from '@/lib/types';

interface StatusCardProps {
  config: MonitoringConfig | undefined;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  statusCode: number | null | undefined;
  nextCheckTime: string;
  checkInterval: string;
  isLoading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  config,
  isActive,
  onToggle,
  statusCode,
  nextCheckTime,
  checkInterval,
  isLoading
}) => {
  const getStatusColor = () => {
    if (!statusCode || statusCode >= 400) return 'bg-error';
    return 'bg-success';
  };

  const getStatusText = () => {
    if (!statusCode) return 'Unknown';
    if (statusCode >= 200 && statusCode < 300) return 'Operational';
    if (statusCode >= 300 && statusCode < 400) return 'Redirected';
    if (statusCode >= 400 && statusCode < 500) return 'Client Error';
    if (statusCode >= 500) return 'Server Error';
    return 'Unknown';
  };

  return (
    <div className="bg-dark bg-opacity-50 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Monitor Status</h2>
        
        <ToggleSwitch 
          isActive={isActive} 
          onToggle={onToggle} 
          label="Status" 
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center mb-4">
        <div className="flex-1">
          <div className="text-sm opacity-70 mb-1">Target URL</div>
          <div className="font-mono text-sm bg-dark bg-opacity-50 py-1 px-2 rounded border border-gray-800 overflow-x-auto whitespace-nowrap">
            {config?.targetUrl || 'Loading...'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-70 mb-1">Status</div>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor()} mr-2 ${isActive ? 'animate-pulse' : ''}`}></span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
        </div>
        <div>
          <div className="text-sm opacity-70 mb-1">Next Check</div>
          <div className="font-medium">{nextCheckTime}</div>
        </div>
        <div>
          <div className="text-sm opacity-70 mb-1">Interval</div>
          <div className="font-medium">{checkInterval}</div>
        </div>
      </div>
    </div>
  );
};
