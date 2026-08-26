import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../utils/format';

function IncomeExpenseBarChart({ income = 0, expenses = 0 }) {
  const data = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
          <Cell fill="#16a34a" />
          <Cell fill="#dc2626" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default React.memo(IncomeExpenseBarChart);
