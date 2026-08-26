import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LABELS } from '../../utils/constants';
import EmptyState from '../EmptyState.jsx';
import { HandCoins } from 'lucide-react';

const COLORS = {
  PAID: '#16a34a',
  PARTIALLY_PAID: '#2563eb',
  OUTSTANDING: '#d97706',
  OVERDUE: '#dc2626',
};

function LoanStatusChart({ breakdown }) {
  const data = Object.entries(breakdown || {}).map(([status, count]) => ({
    status,
    name: LABELS[status] || status,
    count,
  }));

  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (!total) {
    return <EmptyState icon={HandCoins} title="No loans yet" description="Loans you give to friends will appear here." />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((d) => (
            <Cell key={d.status} fill={COLORS[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default React.memo(LoanStatusChart);
