import { useState } from 'react';

interface PresetOption {
  id: string;
  label: string;
  description: string;
  values: Record<string, number | string>;
  icon?: string;
}

interface QuickPresetsProps {
  presets: PresetOption[];
  onPresetSelect: (values: Record<string, number | string>) => void;
  className?: string;
}

const QuickPresets = ({ presets, onPresetSelect, className = '' }: QuickPresetsProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: PresetOption) => {
    setSelectedPreset(preset.id);
    onPresetSelect(preset.values);
    
    // Reset selection after a brief delay for visual feedback
    setTimeout(() => setSelectedPreset(null), 200);
  };

  if (presets.length === 0) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-3 flex items-center">
        <i className="fas fa-magic text-blue-600 dark:text-blue-400 mr-2"></i>
        Quick Presets
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Click any preset to auto-fill common scenarios
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`
              p-3 text-left rounded-lg border border-blue-200 dark:border-blue-700
              hover:bg-blue-100 dark:hover:bg-blue-800/30 
              transition-all duration-200 transform hover:scale-105
              ${selectedPreset === preset.id 
                ? 'bg-blue-200 dark:bg-blue-700 scale-105' 
                : 'bg-white dark:bg-neutral-800'
              }
            `}
            data-testid={`preset-${preset.id}`}
          >
            <div className="flex items-start space-x-3">
              {preset.icon && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${preset.icon} text-white text-sm`}></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-800 dark:text-neutral-100 text-sm">
                  {preset.label}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {preset.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">
        💡 These presets help you get started quickly with common calculations
      </div>
    </div>
  );
};

export default QuickPresets;