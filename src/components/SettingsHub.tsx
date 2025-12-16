import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export default function SettingsHub() {
  const [configs, setConfigs] = useState<Record<string, ConfigItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getConfig();
      setConfigs(data);
    } catch (err) {
      toast.error('Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = async (key: string, category: string) => {
    try {
      await api.updateConfig(key, editValue, category);
      toast.success('Configuration updated successfully!');
      setEditingKey(null);
      fetchConfig();
    } catch (err) {
      toast.error('Failed to update configuration');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

    try {
      await api.deleteConfig(key);
      toast.success('Configuration deleted successfully!');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to delete configuration');
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error('Please enter both key and value');
      return;
    }

    try {
      await api.updateConfig(newKey, newValue, newCategory);
      toast.success('Configuration added successfully!');
      setNewKey('');
      setNewValue('');
      setNewCategory('general');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to add configuration');
    }
  };

  const categories = Object.keys(configs).sort();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      general: '⚙️',
      security: '🔒',
      blockchain: '⛓️',
      notifications: '🔔',
      spam: '🚫',
      portal: '🚪',
      bot: '🤖',
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      security: 'bg-red-100 text-red-800',
      blockchain: 'bg-purple-100 text-purple-800',
      notifications: 'bg-blue-100 text-blue-800',
      spam: 'bg-orange-100 text-orange-800',
      portal: 'bg-green-100 text-green-800',
      bot: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Centralized system configuration management</p>
        </div>
      </div>

      {/* Add New Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Configuration Key"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="general">General</option>
            <option value="security">Security</option>
            <option value="blockchain">Blockchain</option>
            <option value="notifications">Notifications</option>
            <option value="spam">Spam Control</option>
            <option value="portal">Portal</option>
            <option value="bot">Bot</option>
          </select>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
          >
            Add Setting
          </button>
        </div>
      </div>

      {/* Configuration Categories */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No configuration found</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first configuration setting above.</p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category)}`}>
                  {configs[category].length} {configs[category].length === 1 ? 'setting' : 'settings'}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {configs[category].map((config) => (
                <div key={config.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  {editingKey === config.key ? (
                    // Edit Mode
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-2">{config.key}</div>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(config.key, config.category)}
                          className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{config.key}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                          {config.value}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(config.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(config.key, config.value)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(config.key)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900">Configuration Management</h4>
            <p className="text-sm text-blue-800 mt-1">
              Settings are stored in the database and can be accessed by all bot services. Changes take effect immediately without requiring a restart.
              Use categories to organize related settings. System-critical settings should be handled with care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
