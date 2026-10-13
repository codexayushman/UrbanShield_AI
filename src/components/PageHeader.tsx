import type { ReactNode } from 'react';
import FadeIn from './FadeIn';
import { DataSourceBanner } from './DataLabel';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  dataBanner?: string;
}

export default function PageHeader({ title, description, icon, dataBanner }: PageHeaderProps) {
  return (
    <FadeIn className="mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {dataBanner && <div className="mt-4"><DataSourceBanner message={dataBanner} /></div>}
    </FadeIn>
  );
}
