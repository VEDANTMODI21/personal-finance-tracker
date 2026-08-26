import React from 'react';
import { Pencil, Trash2, HandCoins, CalendarClock } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import Tilt3D from './Tilt3D.jsx';
import { formatCurrency, formatDate } from '../utils/format';

export default function LoanCard({ loan, onEdit, onDelete, onRecordPayment }) {
  return (
    <Tilt3D max={6}>
      <div className="card card-shine p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{loan.personName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Given {formatDate(loan.dateGiven)}</p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Given</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(loan.amount)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Repaid</p>
            <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(loan.totalRepaid)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Outstanding</p>
            <p className="font-medium text-red-600 dark:text-red-400">{formatCurrency(loan.remainingAmount)}</p>
          </div>
        </div>

        {loan.dueDate && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarClock size={13} /> Due {formatDate(loan.dueDate)}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {loan.status !== 'PAID' && (
            <button className="btn-primary !py-1.5 text-xs" onClick={() => onRecordPayment(loan)}>
              <HandCoins size={14} /> Record Repayment
            </button>
          )}
          <button className="btn-secondary !py-1.5 text-xs" onClick={() => onEdit(loan)}>
            <Pencil size={14} /> Edit
          </button>
          <button className="btn-secondary !py-1.5 text-xs text-red-500" onClick={() => onDelete(loan)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </Tilt3D>
  );
}
