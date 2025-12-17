import { useEffect, useState } from 'react';
import { api } from '../services/api';
import LiveDetectionFeed from './LiveDetectionFeed';

interface SecurityOverview {
  groupId: string;
  groupName: string;
  spamMode: string;
  antiRaidEnabled: boolean;
  isInLockdown: boolean;
  spamViolations24h: number;
  totalRaids: number;
}

export default function SecurityDashboard() {
  const [overview, setOverview] = useState<SecurityOverview[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const data = await api.getSecurityOverview();
      setOverview(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0].groupId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading && overview.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading security dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const selectedGroupData = overview.find((g) => g.groupId === selectedGroup);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Group Selector */}
      {overview.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {overview.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {group.groupName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Security Stats Cards */}
      {selectedGroupData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Spam Mode */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Spam Mode</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                  {selectedGroupData.spamMode}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                selectedGroupData.spamMode === 'off' ? 'bg-gray-100' :
                selectedGroupData.spamMode === 'standard' ? 'bg-blue-100' :
                selectedGroupData.spamMode === 'strict' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Anti-Raid Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anti-Raid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedGroupData.antiRaidEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                selectedGroupData.antiRaidEnabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lockdown Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lockdown</p>
                <p className={`text-2xl font-bold mt-1 ${
                  selectedGroupData.isInLockdown ? 'text-red-600' : 'text-green-600'
                }`}>
                  {selectedGroupData.isInLockdown ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                selectedGroupData.isInLockdown ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Violations (24h) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Violations (24h)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedGroupData.spamViolations24h}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs for detailed views */}
      {selectedGroup && (
        <div className="bg-white rounded-lg shadow">
          <SecurityTabs groupId={selectedGroup} />
        </div>
      )}
    </div>
  );
}

// Security Tabs Component
function SecurityTabs({ groupId }: { groupId: string }) {
  const [activeTab, setActiveTab] = useState<'spam' | 'raid' | 'live'>('spam');

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'spam'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Spam Control
          </button>
          <button
            onClick={() => setActiveTab('raid')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'raid'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Anti-Raid
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'live'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Live Feed
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'spam' && <SpamControlTab groupId={groupId} />}
        {activeTab === 'raid' && <AntiRaidTab groupId={groupId} />}
        {activeTab === 'live' && <LiveDetectionFeed groupId={groupId} refreshInterval={10000} />}
      </div>
    </div>
  );
}

// Spam Control Tab
function SpamControlTab({ groupId }: { groupId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, violationsData] = await Promise.all([
        api.getSpamStats(groupId),
        api.getSpamViolations(groupId, 20),
      ]);
      setStats(statsData);
      setViolations(violationsData);
    } catch (err) {
      console.error('Error fetching spam data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading spam control data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Violations</p>
            <p className="text-xl font-bold text-red-600">{stats.totalViolations}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Users with Violations</p>
            <p className="text-xl font-bold text-orange-600">{stats.usersWithViolations}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Recent (24h)</p>
            <p className="text-xl font-bold text-yellow-600">{stats.recentViolations24h}</p>
          </div>
        </div>
      )}

      {/* Recent Violations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Violations</h3>
        {violations.length === 0 ? (
          <p className="text-gray-500">No violations recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Msg/Min</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Msg/Hour</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.map((violation: any) => (
                  <tr key={violation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.telegramUserId?.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {violation.violationCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {violation.lastViolationAt ? new Date(violation.lastViolationAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.messagesLastMinute}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.messagesLastHour}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Anti-Raid Tab
function AntiRaidTab({ groupId }: { groupId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, eventsData] = await Promise.all([
        api.getRaidStats(groupId),
        api.getRaidEvents(groupId, 10),
      ]);
      setStats(statsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching raid data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndLockdown = async (eventId: string) => {
    if (!confirm('Are you sure you want to end the lockdown?')) return;

    try {
      await api.resolveRaidEvent(groupId, eventId);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error ending lockdown:', err);
      alert('Failed to end lockdown');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading anti-raid data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Raids</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalRaids}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Active Raids</p>
            <p className="text-xl font-bold text-red-600">{stats.activeRaids}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Resolved Raids</p>
            <p className="text-xl font-bold text-green-600">{stats.resolvedRaids}</p>
          </div>
        </div>
      )}

      {/* Current Lockdown Status */}
      {stats?.isCurrentlyInLockdown && stats?.recentRaid && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-red-800">LOCKDOWN ACTIVE</h4>
              <p className="text-sm text-red-600 mt-1">
                Triggered: {new Date(stats.recentRaid.triggeredAt).toLocaleString()}
              </p>
              <p className="text-sm text-red-600">
                Join count: {stats.recentRaid.joinCount}
              </p>
              <p className="text-sm text-red-600">
                Lockdown until: {new Date(stats.recentRaid.lockdownUntil).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleEndLockdown(events.find(e => !e.resolved)?.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              End Lockdown
            </button>
          </div>
        </div>
      )}

      {/* Raid Events History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Raid Events History</h3>
        {events.length === 0 ? (
          <p className="text-gray-500">No raid events recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Triggered At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Window</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lockdown Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event: any) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {event.joinCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.timeWindow}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.lockdownUntil ? new Date(event.lockdownUntil).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

