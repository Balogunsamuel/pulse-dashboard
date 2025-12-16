import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { AdvancedFilter, FilterField } from './AdvancedFilter';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'config.updated'
  | 'security.updated'
  | 'trust_level.changed'
  | 'data.exported'
  | 'portal.updated'
  | 'token.added'
  | 'token.removed';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  userId: string;
  username: string;
  userRole: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export function AuditLog() {
  const [filters, setFilters] = useState<any>({});
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await api.getAuditLogs(filters);
        setLogs(data || []);
      } catch (err) {
        toast.error('Failed to load audit logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [filters]);

  const filterFields: FilterField[] = [
    {
      type: 'select',
      field: 'action',
      label: 'Action Type',
      options: [
        { label: 'User Login', value: 'user.login' },
        { label: 'User Logout', value: 'user.logout' },
        { label: 'Config Updated', value: 'config.updated' },
        { label: 'Security Updated', value: 'security.updated' },
        { label: 'Trust Level Changed', value: 'trust_level.changed' },
        { label: 'Data Exported', value: 'data.exported' },
      ],
    },
    {
      type: 'select',
      field: 'userRole',
      label: 'User Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      type: 'text',
      field: 'username',
      label: 'Username',
      placeholder: 'Search by username',
    },
    {
      type: 'text',
      field: 'ipAddress',
      label: 'IP Address',
      placeholder: 'e.g., 192.168.1.1',
    },
  ];

  const getActionIcon = (action: AuditAction) => {
    if (action.startsWith('user.')) return '👤';
    if (action.startsWith('config.')) return '⚙️';
    if (action.startsWith('security.')) return '🛡️';
    if (action.startsWith('trust_level.')) return '⭐';
    if (action.startsWith('data.')) return '📊';
    if (action.startsWith('portal.')) return '🚪';
    if (action.startsWith('token.')) return '💎';
    return '📝';
  };

  const getActionColor = (action: AuditAction) => {
    if (action.includes('delete')) return 'text-red-600 dark:text-red-400';
    if (action.includes('created') || action.includes('added')) return 'text-green-600 dark:text-green-400';
    if (action.includes('updated') || action.includes('changed')) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const handleExportLogs = () => {
    toast.info('Export not implemented yet');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Audit Log</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all administrative actions and changes
          </p>
        </div>
        <button
          onClick={handleExportLogs}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
        >
          📥 Export Logs
        </button>
      </div>

      {/* Filters */}
      <AdvancedFilter
        fields={filterFields}
        onFilterChange={setFilters}
        storageKey="audit_log_filters"
      />

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No audit entries found.
                  </td>
                </tr>
              )}
              {!loading && logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center gap-2 text-sm font-medium ${getActionColor(log.action)}`}>
                      <span className="text-lg">{getActionIcon(log.action)}</span>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium dark:text-white">{log.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {log.userRole}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm dark:text-white">{log.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {log.metadata && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                          View
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded overflow-auto text-gray-700 dark:text-gray-300">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">5</span> results
            </div>
            <div className="flex gap-2">
              <button
                disabled
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
