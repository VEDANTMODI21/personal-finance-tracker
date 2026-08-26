import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatAxisValue } from '../../utils/format';
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
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} tickFormatter={formatAxisValue} />
        <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(l) => `Day ${l}`} />
        <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(MonthlyLineChart);
