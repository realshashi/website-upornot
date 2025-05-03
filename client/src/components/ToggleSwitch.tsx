import React from 'react';

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  isActive, 
  onToggle, 
  label,
  disabled = false
}) => {
  return (
    <div className="flex items-center">
      {label && <span className="text-sm mr-3">{isActive ? 'Active' : 'Paused'}</span>}
      <div 
        className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onToggle(!isActive)}
      >
        <div 
          className={`absolute top-0 left-0 w-6 h-6 transition-all duration-200 transform bg-primary rounded-full shadow-md ${isActive ? 'translate-x-6' : 'translate-x-0'}`} 
        />
        <div className="block h-full rounded-full bg-opacity-20 bg-white"></div>
      </div>
    </div>
  );
};
