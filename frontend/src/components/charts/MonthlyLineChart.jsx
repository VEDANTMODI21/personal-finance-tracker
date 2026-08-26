import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/format';
import EmptyState from '../EmptyState.jsx';
import { TrendingUp } from 'lucide-react';

function MonthlyLineChart({ data = [] }) {
  if (!data.length) {
    return <EmptyState icon={TrendingUp} title="No spending data" description="Daily spending will be plotted here once you add expenses." />;
  }

  const chartData = data.map((d) => ({ ...d, day: new Date(d.date).getDate() }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(l) => `Day ${l}`} />
        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(MonthlyLineChart);
