import { useState, useEffect } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { subDays } from 'date-fns';

export interface FilterField {
  type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean';
  field: string;
  label: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FilterValue {
  [key: string]: any;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValue;
}

interface AdvancedFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: FilterValue) => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: FilterValue) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (id: string) => void;
  storageKey?: string;
}

export function AdvancedFilter({
  fields,
  onFilterChange,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  storageKey = 'advanced_filters',
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterValue>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  // Load saved filters from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFilters(parsed);
          onFilterChange(parsed);
        } catch (error) {
          console.error('Failed to load saved filters:', error);
        }
      }
    }
  }, [storageKey]);

  // Save filters to localStorage
  useEffect(() => {
    if (storageKey && Object.keys(filters).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    }
  }, [filters, storageKey]);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters({});
    onFilterChange({});
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName, filters);
      setPresetName('');
      setShowPresetDialog(false);
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    onFilterChange(preset.filters);
    if (onLoadPreset) {
      onLoadPreset(preset);
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left font-medium dark:text-white"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear all
              </button>
            )}
            {onSavePreset && activeFilterCount > 0 && (
              <button
                onClick={() => setShowPresetDialog(true)}
                className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Save Preset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Fields */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Presets */}
          {presets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saved Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                  >
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      {preset.name}
                    </button>
                    {onDeletePreset && (
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(field => (
              <div key={field.field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={filters[field.field] || ''}
                    onChange={(e) => handleFilterChange(field.field, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                  />
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    value={filters[field.field] || ''}
                    onChange={(e) => handleFilterChange(field.field, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={filters[field.field] || ''}
                    onChange={(e) => handleFilterChange(field.field, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
                  >
                    <option value="">All</option>
                    {field.options?.map(opt => (
                      <option key={String(opt.value)} value={opt.value as any}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[field.field] || false}
                      onChange={(e) => handleFilterChange(field.field, e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm dark:text-gray-300">{field.placeholder || 'Enable'}</span>
                  </label>
                )}

                {field.type === 'date' && (
                  <DateRangePicker
                    value={filters[field.field] || { start: subDays(new Date(), 30), end: new Date() }}
                    onChange={(range) => handleFilterChange(field.field, range)}
                  />
                )}

                {field.type === 'multiselect' && (
                  <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-2">
                    {field.options?.map(opt => (
                      <label key={String(opt.value)} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(filters[field.field] || []).includes(opt.value)}
                          onChange={(e) => {
                            const current = filters[field.field] || [];
                            const updated = e.target.checked
                              ? [...current, opt.value]
                              : current.filter((v: any) => v !== opt.value);
                            handleFilterChange(field.field, updated);
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm dark:text-gray-300">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Filters Pills */}
          {activeFilterCount > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active Filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value === undefined || value === '' || value === null) return null;

                  const field = fields.find(f => f.field === key);
                  if (!field) return null;

                  let displayValue: string;
                  if (field.type === 'select') {
                    const option = field.options?.find(o => o.value === value);
                    displayValue = option?.label || String(value);
                  } else if (field.type === 'boolean') {
                    displayValue = value ? 'Yes' : 'No';
                  } else if (field.type === 'multiselect') {
                    const values = value as any[];
                    displayValue = `${values.length} selected`;
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm"
                    >
                      <span className="font-medium">{field.label}:</span>
                      <span>{displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, undefined)}
                        className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Preset Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Save Filter Preset</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded dark:text-white mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowPresetDialog(false);
                  setPresetName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
