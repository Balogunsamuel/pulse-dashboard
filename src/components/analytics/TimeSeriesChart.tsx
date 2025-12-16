import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  [key: string]: any;
}

interface TimeSeriesChartProps {
  data: ChartDataPoint[];
  comparisonData?: ChartDataPoint[];
  dataKey?: string;
  comparisonKey?: string;
  title: string;
  color?: string;
  comparisonColor?: string;
  type?: 'line' | 'area';
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  comparisonData,
  dataKey = 'value',
  comparisonKey = 'value',
  title,
  color = '#0ea5e9',
  comparisonColor = '#94a3b8',
  type = 'line',
  valueFormatter = (v) => v.toLocaleString(),
  height = 300,
}: TimeSeriesChartProps) {
  const ChartComponent = type === 'line' ? LineChart : AreaChart;
  const DataComponent: any = type === 'line' ? Line : Area;

  // Merge data if comparison data exists
  const mergedData = data.map((item, index) => ({
    ...item,
    comparison: comparisonData?.[index]?.[comparisonKey],
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold dark:text-white mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => {
              try {
                return format(new Date(value), 'MMM dd');
              } catch {
                return value;
              }
            }}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={valueFormatter}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #1f2937)',
              border: '1px solid var(--tooltip-border, #374151)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            formatter={(value: any) => [valueFormatter(value), '']}
            labelFormatter={(label) => {
              try {
                return format(new Date(label), 'MMM dd, yyyy HH:mm');
              } catch {
                return label;
              }
            }}
          />
          {comparisonData && <Legend />}

          {/* Main data */}
          <DataComponent
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={type === 'area' ? color : undefined}
            fillOpacity={0.3}
            strokeWidth={2}
            name="Current"
            dot={false}
            activeDot={{ r: 6 }}
          />

          {/* Comparison data */}
          {comparisonData && (
            <DataComponent
              type="monotone"
              dataKey="comparison"
              stroke={comparisonColor}
              fill={type === 'area' ? comparisonColor : undefined}
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Previous"
              dot={false}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
