import { motion, useReducedMotion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: 'cyan' | 'orange' | 'red' | 'green' | 'blue' | 'purple';
  suffix?: string;
  trend?: string;
  isSimulated?: boolean;
  onClick?: () => void;
}

const colorConfig = {
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-orange-500/10' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-red-500/10' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', glow: 'shadow-green-500/10' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
};

export default function StatCard({ label, value, icon: Icon, color = 'cyan', suffix, trend, isSimulated, onClick }: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = colorConfig[color];
  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-xl border ${config.border} ${config.bg} p-5 shadow-lg ${config.glow} ${onClick ? 'cursor-pointer text-left transition-colors hover:border-opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${config.text}`}>
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
        </div>
        <div className={`rounded-lg ${config.bg} p-2.5`}>
          <Icon className={`h-5 w-5 ${config.text}`} />
        </div>
      </div>
      {isSimulated && (
        <span className="absolute right-2 top-2 rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-500">
          SAMPLE
        </span>
      )}
    </Tag>
  );
}
