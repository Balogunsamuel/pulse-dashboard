import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { SearchFilter, ExportButtons } from './Filters';

interface TrustLevel {
  id: string;
  userId: string;
  groupId: string;
  level: number;
  messageCount: number;
  warningCount: number;
  joinedAt: string;
  lastMessageAt: string | null;
  user: {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
  };
}

interface TrustStats {
  level1: number;
  level2: number;
  level3: number;
  totalMessages: number;
  totalWarnings: number;
  total: number;
}

export default function TrustLevelDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [trustLevels, setTrustLevels] = useState<TrustLevel[]>([]);
  const [stats, setStats] = useState<TrustStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchData();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to fetch groups');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [levelsData, statsData] = await Promise.all([
        api.getTrustLevels(selectedGroup),
        api.getTrustStats(selectedGroup),
      ]);
      setTrustLevels(levelsData);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to fetch trust level data');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (trustLevelId: string) => {
    try {
      await api.promoteTrustLevel(trustLevelId);
      toast.success('User promoted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to promote user');
    }
  };

  const handleDemote = async (trustLevelId: string) => {
    if (!confirm('Are you sure you want to demote this user?')) return;

    try {
      await api.demoteTrustLevel(trustLevelId);
      toast.success('User demoted successfully!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to demote user');
    }
  };

  const getLevelName = (level: number) => {
    const names = { 1: 'New Member', 2: 'Trusted Member', 3: 'VIP Member' };
    return names[level as keyof typeof names] || 'Unknown';
  };

  const getLevelEmoji = (level: number) => {
    const emojis = { 1: '🆕', 2: '✅', 3: '⭐' };
    return emojis[level as keyof typeof emojis] || '❓';
  };

  const getLevelColor = (level: number) => {
    const colors = { 1: 'bg-gray-100 text-gray-800', 2: 'bg-blue-100 text-blue-800', 3: 'bg-yellow-100 text-yellow-800' };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredLevels = trustLevels.filter((tl) => {
    const matchesSearch =
      !searchQuery ||
      tl.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tl.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tl.user.telegramId.toString().includes(searchQuery);

    const matchesLevel = selectedLevel === null || tl.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const pieData = stats
    ? [
        { name: 'New Members', value: stats.level1, color: '#9CA3AF' },
        { name: 'Trusted Members', value: stats.level2, color: '#3B82F6' },
        { name: 'VIP Members', value: stats.level3, color: '#FBBF24' },
      ]
    : [];

  const barData = trustLevels.slice(0, 10).map((tl) => ({
    name: tl.user.username || tl.user.firstName || `User ${tl.user.telegramId.toString().slice(0, 6)}`,
    messages: tl.messageCount,
    warnings: tl.warningCount,
  }));

  if (loading && trustLevels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading trust level data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Trust Level Management</h2>
        <ExportButtons data={filteredLevels} filename="trust-levels" />
      </div>

      {/* Group Selector */}
      {groups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">New Members (L1)</p>
            <p className="text-3xl font-bold text-gray-500 mt-2">{stats.level1}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Trusted (L2)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.level2}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">VIP (L3)</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.level3}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Warnings</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalWarnings}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Users Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#3B82F6" name="Messages" />
              <Bar dataKey="warnings" fill="#EF4444" name="Warnings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchFilter placeholder="Search by username, name, or ID..." onSearch={setSearchQuery} />
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
                selectedLevel === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
                  selectedLevel === level
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({filteredLevels.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLevels.map((tl) => (
                <tr key={tl.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tl.user.username || tl.user.firstName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">ID: {tl.user.telegramId.toString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(tl.level)}`}>
                      {getLevelEmoji(tl.level)} {getLevelName(tl.level)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tl.messageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tl.warningCount > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {tl.warningCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tl.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {tl.level < 3 && (
                      <button
                        onClick={() => handlePromote(tl.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Promote
                      </button>
                    )}
                    {tl.level > 1 && (
                      <button
                        onClick={() => handleDemote(tl.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Demote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
