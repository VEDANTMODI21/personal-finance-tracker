import React from 'react';
import { STATUS_STYLES, LABELS } from '../utils/constants';

export default function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>{LABELS[status] || status}</span>;
}
