import type { RiskCategory, Priority } from '@/types';

const riskConfig: Record<RiskCategory, { bg: string; text: string; border: string; dot: string }> = {
  'Low': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
  'Moderate': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  'High': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  'Very High': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
};

const priorityConfig: Record<Priority, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-400/40' },
  moderate: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export function RiskBadge({ category, score }: { category: RiskCategory; score?: number }) {
  const config = riskConfig[category] ?? riskConfig['Low'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} px-2.5 py-0.5 text-xs font-medium`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {category}{score !== undefined && ` (${score})`}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} px-2.5 py-0.5 text-xs font-medium capitalize`}>
      {priority}
    </span>
  );
}
