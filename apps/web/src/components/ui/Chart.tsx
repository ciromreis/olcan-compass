import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

// Color-blind friendly palette
const CHART_COLORS = {
  primary: '#3b82f6', // lumina-600
  secondary: '#8b5cf6', // purple
  tertiary: '#10b981', // green
  quaternary: '#f59e0b', // amber
  quinary: '#ef4444', // red
};

export interface RadarChartProps {
  data: Array<{ [key: string]: any }>;
  dataKeys: string[];
  nameKey: string;
  className?: string;
  height?: number;
}

export const RadarChartComponent: React.FC<RadarChartProps> = ({
  data,
  dataKeys,
  nameKey,
  className,
  height = 300,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey={nameKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
          {dataKeys.map((key, index) => (
            <Radar
              key={key}
              
              dataKey={key}
              stroke={Object.values(CHART_COLORS)[index % 5]}
              fill={Object.values(CHART_COLORS)[index % 5]}
              fillOpacity={0.3}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface BarChartProps {
  data: Array<{ [key: string]: any }>;
  dataKeys: string[];
  xAxisKey: string;
  className?: string;
  height?: number;
  stacked?: boolean;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  dataKeys,
  xAxisKey,
  className,
  height = 300,
  stacked = false,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xAxisKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={Object.values(CHART_COLORS)[index % 5]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface LineChartProps {
  data: Array<{ [key: string]: any }>;
  dataKeys: string[];
  xAxisKey: string;
  className?: string;
  height?: number;
}

export const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  dataKeys,
  xAxisKey,
  className,
  height = 300,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xAxisKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={Object.values(CHART_COLORS)[index % 5]}
              strokeWidth={2}
              dot={{ fill: Object.values(CHART_COLORS)[index % 5], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
