import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DashboardData {
  overview: {
    totalGroups: number;
    totalVerifiedUsers: number;
    totalTrackedTokens: number;
    totalTransactions: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await api.getDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600">Failed to load dashboard</div>;
  }

  const stats = [
    {
      name: 'Total Groups',
      value: data.overview.totalGroups,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      name: 'Verified Users',
      value: data.overview.totalVerifiedUsers,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      name: 'Tracked Tokens',
      value: data.overview.totalTrackedTokens,
      icon: '💎',
      color: 'bg-purple-500',
    },
    {
      name: 'Total Transactions',
      value: data.overview.totalTransactions,
      icon: '📊',
      color: 'bg-orange-500',
    },
  ];

  // Check if all stats are zero
  const allZero = stats.every(s => s.value === 0);
  const hasZeros = stats.some(s => s.value === 0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Dashboard Overview</h2>

      {/* Empty State Alert */}
      {allZero && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>No data available yet.</strong> Your bot appears to be inactive or hasn't tracked any data. Add groups, configure tokens, and start tracking transactions to see statistics here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partial Zero State Alert */}
      {!allZero && hasZeros && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Some metrics are showing zero.</strong> This may indicate missing configuration or recent setup. Check your token tracking and group settings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3 text-2xl`}>
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className={`text-2xl font-semibold ${stat.value === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {stat.value.toLocaleString()}
                      {stat.value === 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-600">(No data)</span>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
