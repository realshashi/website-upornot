import React from 'react';
import { MonitoringLog } from '@/lib/types';
import { FaTrashAlt } from 'react-icons/fa';

interface LogPanelProps {
  logs: MonitoringLog[];
  onClearLogs: () => void;
  successRate: string;
  totalRequests: number;
  isClearingLogs: boolean;
}

export const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  onClearLogs,
  successRate,
  totalRequests,
  isClearingLogs
}) => {
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) + ' - ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatStatusCode = (statusCode: number | null, success: boolean) => {
    if (statusCode === null || statusCode === 0) return 'Failed';
    return `${statusCode} ${getStatusText(statusCode)}`;
  };

  const getStatusText = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'OK';
    if (statusCode >= 300 && statusCode < 400) return 'Redirect';
    if (statusCode >= 400 && statusCode < 500) return 'Client Error';
    if (statusCode >= 500) return 'Server Error';
    return '';
  };

  return (
    <div className="bg-dark bg-opacity-50 border border-gray-700 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Request Log</h2>
        <button 
          className={`text-xs text-primary hover:text-opacity-80 transition flex items-center ${isClearingLogs ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={() => !isClearingLogs && onClearLogs()}
          disabled={isClearingLogs}
        >
          <FaTrashAlt className="mr-1" />
          Clear
        </button>
      </div>

      <div className="h-64 overflow-y-auto pr-2">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center text-sm opacity-70 py-4">
              No logs available. Monitoring requests will appear here.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-dark bg-opacity-40 rounded border border-gray-800 p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${log.success ? 'bg-success' : 'bg-error'} mr-2`}></span>
                    <span className="font-medium">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      log.success 
                        ? 'bg-success bg-opacity-20 text-success' 
                        : 'bg-error bg-opacity-20 text-error'
                    }`}
                  >
                    {formatStatusCode(log.statusCode, log.success)}
                  </span>
                </div>
                <div className="font-mono text-xs opacity-70 truncate">GET {log.url}</div>
                <div className="text-xs mt-1">{log.message}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
        <div>Success rate: {successRate}</div>
        <div>Total requests: {totalRequests}</div>
      </div>
    </div>
  );
};
