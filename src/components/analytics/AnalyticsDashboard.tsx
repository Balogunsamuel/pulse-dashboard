import { useEffect, useMemo, useState } from 'react';
import { TimeSeriesChart } from './TimeSeriesChart';
import { DateRange, DateRangePicker } from '../DateRangePicker';
import { subDays } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

type Granularity = 'hour' | 'day' | 'week' | 'month';
type MetricType = 'transactions' | 'volume' | 'users' | 'security';

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('transactions');
  const [showComparison, setShowComparison] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [comparisonSeries, setComparisonSeries] = useState<any[]>([]);
  const [chainDistribution, setChainDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topTokens, setTopTokens] = useState<{ name: string; transactions: number; volume: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const days = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000)));
        const [dailyStats, tokens] = await Promise.all([
          api.getDailyStats({ days }),
          api.getTokens(),
        ]);

        const mappedSeries = (dailyStats || []).map((item: any) => ({
          timestamp: item.date || item.timestamp,
          value: selectedMetric === 'volume' ? item.volumeUsd || item.volume || 0 : item.count || item.value || 0,
        }));
        setSeries(mappedSeries);

        if (showComparison) {
          const comparison = (dailyStats || []).slice(-Math.min(mappedSeries.length, 7)).map((item: any) => ({
            timestamp: item.date || item.timestamp,
            value: selectedMetric === 'volume' ? item.volumeUsd || item.volume || 0 : item.count || item.value || 0,
          }));
          setComparisonSeries(comparison);
        } else {
          setComparisonSeries([]);
        }

        // Chain distribution from tokens
        const distributionMap: Record<string, number> = {};
        (tokens || []).forEach((t: any) => {
          const key = (t.chain || 'unknown').toUpperCase();
          distributionMap[key] = (distributionMap[key] || 0) + 1;
        });
        const palette = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f97316', '#eab308', '#ef4444'];
        const distribution = Object.entries(distributionMap).map(([name, value], idx) => ({
          name,
          value,
          color: palette[idx % palette.length],
        }));
        setChainDistribution(distribution);

        // Top tokens by transactions if available
        const tops = (tokens || [])
          .map((t: any) => ({
            name: t.tokenSymbol || t.symbol || 'TOKEN',
            transactions: t._count?.transactions || 0,
            volume: t.volumeUsd || 0,
          }))
          .sort((a: any, b: any) => b.transactions - a.transactions)
          .slice(0, 10);
        setTopTokens(tops);
      } catch (err) {
        toast.error('Failed to load analytics');
        setSeries([]);
        setComparisonSeries([]);
        setChainDistribution([]);
        setTopTokens([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange, selectedMetric, showComparison]);

  const getMetricFormatter = useMemo(() => {
    if (selectedMetric === 'volume') {
      return (v: number) => `$${(v || 0).toLocaleString()}`;
    }
    return (v: number) => (v || 0).toLocaleString();
  }, [selectedMetric]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          {/* Granularity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Granularity
            </label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as Granularity)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          {/* Metric Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm dark:text-white"
            >
              <option value="transactions">Transaction Count</option>
              <option value="volume">Transaction Volume</option>
              <option value="users">Active Users</option>
              <option value="security">Security Events</option>
            </select>
          </div>

          {/* Comparison Toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm dark:text-gray-300">Compare with previous period</span>
            </label>
          </div>

          {/* Export Button */}
          <div className="flex items-end ml-auto">
            <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm">
              📊 Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</div>
          <div className="text-3xl font-bold dark:text-white mt-2">{series.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on selected range</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Volume</div>
          <div className="text-3xl font-bold dark:text-white mt-2">
            {selectedMetric === 'volume'
              ? `$${series.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}`
              : '—'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on selected range</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
          <div className="text-3xl font-bold dark:text-white mt-2">—</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add backend metric</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Transaction</div>
          <div className="text-3xl font-bold dark:text-white mt-2">
            {series.length > 0 && selectedMetric === 'volume'
              ? `$${Math.round(series.reduce((sum, d) => sum + (d.value || 0), 0) / series.length).toLocaleString()}`
              : '—'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add backend metric</div>
        </div>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={series}
          comparisonData={comparisonSeries}
          title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Over Time`}
          type="area"
          valueFormatter={getMetricFormatter}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold dark:text-white mb-4">Distribution by Chain</h3>
          {chainDistribution.length === 0 ? (
            <div className="text-sm text-gray-500">No chain data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chainDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Tokens Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold dark:text-white mb-4">Top Tokens by Activity</h3>
        {topTokens.length === 0 ? (
          <div className="text-sm text-gray-500">No token activity data.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTokens}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="transactions" fill="#0ea5e9" name="Transactions" />
              <Bar dataKey="volume" fill="#8b5cf6" name="Volume ($)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Period Comparison Table */}
      {showComparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Period Comparison</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Metric</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Current</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Previous</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 text-sm dark:text-white">Transactions</td>
                  <td className="text-right py-3 text-sm dark:text-white">1,234</td>
                  <td className="text-right py-3 text-sm dark:text-white">1,098</td>
                  <td className="text-right py-3 text-sm text-green-600 dark:text-green-400">+12.4%</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 text-sm dark:text-white">Volume</td>
                  <td className="text-right py-3 text-sm dark:text-white">$2.4M</td>
                  <td className="text-right py-3 text-sm dark:text-white">$2.2M</td>
                  <td className="text-right py-3 text-sm text-green-600 dark:text-green-400">+9.1%</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm dark:text-white">Active Users</td>
                  <td className="text-right py-3 text-sm dark:text-white">456</td>
                  <td className="text-right py-3 text-sm dark:text-white">433</td>
                  <td className="text-right py-3 text-sm text-green-600 dark:text-green-400">+5.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
