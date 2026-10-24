import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from './Icons.jsx';

export function StatusBadge({ status }) {
  const { category, label, badgeClass } = status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${badgeClass}`}
    >
      {category === 'danger' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <AlertCircle className="w-3.5 h-3.5" />
        </>
      )}

      {category === 'warning' && (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      )}

      {category === 'healthy' && (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      )}

      <span>{label}</span>
    </span>
  );
}
