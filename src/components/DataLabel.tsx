import { AlertTriangle } from 'lucide-react';

interface DataLabelProps {
  isSimulated?: boolean;
  source?: string;
  className?: string;
}

export function DataLabel({ isSimulated, source, className = '' }: DataLabelProps) {
  if (isSimulated) {
    return (
      <span className={`inline-flex items-center gap-1 rounded border border-slate-300 bg-slate-200/60 px-1.5 py-0.5 text-[10px] text-slate-500 ${className}`}>
        <AlertTriangle className="h-3 w-3" /> SAMPLE DATA
      </span>
    );
  }
  if (source) {
    return (
      <span className={`inline-flex items-center rounded border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-400 ${className}`}>
        {source}
      </span>
    );
  }
  return null;
}

export function DataSourceBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400/80">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
