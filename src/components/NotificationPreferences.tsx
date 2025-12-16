import { useNotifications, NotificationType } from '../contexts/NotificationContext';

export function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications();

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'security', label: 'Security' },
  ];

  const toggleMutedType = (type: NotificationType) => {
    const mutedTypes = preferences.mutedTypes.includes(type)
      ? preferences.mutedTypes.filter(t => t !== type)
      : [...preferences.mutedTypes, type];

    updatePreferences({ mutedTypes });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold dark:text-white mb-6">Notification Preferences</h2>

      <div className="space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            General
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm dark:text-gray-300">Enable notifications</span>
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => updatePreferences({ enabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm dark:text-gray-300">Show toast notifications</span>
              <input
                type="checkbox"
                checked={preferences.showToasts}
                onChange={(e) => updatePreferences({ showToasts: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                disabled={!preferences.enabled}
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm dark:text-gray-300">Desktop notifications</span>
              <input
                type="checkbox"
                checked={preferences.showDesktopNotifications}
                onChange={(e) => updatePreferences({ showDesktopNotifications: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                disabled={!preferences.enabled}
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm dark:text-gray-300">Sound alerts</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                disabled={!preferences.enabled}
              />
            </label>
          </div>
        </div>

        {/* Minimum Priority */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Minimum Priority
          </h3>
          <select
            value={preferences.minPriority}
            onChange={(e) => updatePreferences({ minPriority: e.target.value as any })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
            disabled={!preferences.enabled}
          >
            <option value="low">Low (all notifications)</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical only</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only show notifications with this priority or higher
          </p>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Notification Types
          </h3>
          <div className="space-y-2">
            {notificationTypes.map(type => (
              <label key={type.value} className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-300">{type.label}</span>
                <input
                  type="checkbox"
                  checked={!preferences.mutedTypes.includes(type.value)}
                  onChange={() => toggleMutedType(type.value)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  disabled={!preferences.enabled}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Uncheck to mute specific notification types
          </p>
        </div>

        {/* Test Notification */}
        <div>
          <button
            onClick={() => {
              // This would trigger a test notification
              // For now, it's just a placeholder
              alert('Test notification would appear here');
            }}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm"
            disabled={!preferences.enabled}
          >
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
}
