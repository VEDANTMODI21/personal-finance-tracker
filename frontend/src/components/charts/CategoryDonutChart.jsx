import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';
import EmptyState from '../EmptyState.jsx';
import { PieChart as PieIcon } from 'lucide-react';

function CategoryDonutChart({ data = [] }) {
  if (!data.length) {
    return <EmptyState icon={PieIcon} title="No spending yet" description="Add an expense to see the category breakdown." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default React.memo(CategoryDonutChart);
