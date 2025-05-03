import React from 'react';
import { FaBroadcastTower, FaCog } from 'react-icons/fa';

interface HeaderProps {
  version?: string;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  version = 'v1.0.0',
  onSettingsClick
}) => {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center">
          <FaBroadcastTower className="mr-3 text-primary" />
          Website Monitor
        </h1>
        <div className="flex items-center">
          <span className="text-xs opacity-70 mr-2">{version}</span>
          {onSettingsClick && (
            <button 
              onClick={onSettingsClick}
              className="text-primary hover:text-opacity-80 transition"
              aria-label="Settings"
            >
              <FaCog />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm opacity-70 mt-1">Silently monitors website uptime every 5 minutes</p>
    </header>
  );
};
