import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { DataSourceBanner } from '@/components/DataLabel';
import { DATA_SOURCES, SAMPLE_TRENDS, SAMPLE_INCIDENT_TYPE_BREAKDOWN, SAMPLE_SECTOR_HEATMAP } from '@/data/analytics';
import { BarChart3, TrendingUp, Filter, Download, ExternalLink } from 'lucide-react';

export default function Analytics() {
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const maxTrend = Math.max(...SAMPLE_TRENDS.map(t => t.value));
  const maxType = Math.max(...SAMPLE_INCIDENT_TYPE_BREAKDOWN.map(t => t.value));
  const maxSector = Math.max(...SAMPLE_SECTOR_HEATMAP.map(s => s.incidentCount));

  const filteredTrends = SAMPLE_TRENDS.filter(t =>
    (sourceFilter === 'all' || t.source === sourceFilter)
  );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Historical trends, incident breakdowns, and sector heatmaps with source and date filters"
        icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}
        dataBanner="All analytics data is SAMPLE data for demonstration. Historical data would come from data.gov.in (Chandigarh crime datasets) and Chandigarh Administration statistical publications. These are NOT real crime statistics."
      />

      {/* Filters */}
      <FadeIn>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-navy-700 bg-navy-850 p-4">
          <Filter className="h-4 w-4 text-cyan-400" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Source:</label>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-1.5 text-sm text-slate-600 focus:outline-none"
            >
              <option value="all">All sources</option>
              <option value="sample_data">Sample Data</option>
              <option value="historical">Historical</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Date Range:</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="rounded-lg border border-navy-600 bg-navy-800 px-3 py-1.5 text-sm text-slate-600 focus:outline-none"
            >
              <option value="all">All time</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-navy-600 bg-navy-800 px-3 py-1.5 text-xs text-slate-500 hover:bg-navy-700">
            <Download className="h-3 w-3" /> Export (Demo)
          </button>
        </div>
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly trends */}
        <FadeIn delay={0}>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <TrendingUp className="h-4 w-4 text-cyan-400" /> Monthly Incident Trends (2025)
            </h2>
            <div className="flex items-end justify-between gap-2 h-48">
              {filteredTrends.map(t => (
                <div key={t.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500">{t.value}</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-cyan-500/40 to-cyan-400/80 transition-all hover:from-cyan-500/60 hover:to-cyan-400"
                    style={{ height: `${(t.value / maxTrend) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-slate-600">{t.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-500">SAMPLE DATA</span>
              <span className="text-[10px] text-slate-600">Source: UrbanShield AI demo dataset</span>
            </div>
          </div>
        </FadeIn>

        {/* Incident type breakdown */}
        <FadeIn delay={0.05}>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <BarChart3 className="h-4 w-4 text-cyan-400" /> Incident Type Breakdown
            </h2>
            <div className="space-y-2.5">
              {SAMPLE_INCIDENT_TYPE_BREAKDOWN.map(t => (
                <div key={t.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{t.label}</span>
                    <span className="text-slate-500">{t.value}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500/60 to-cyan-400"
                      style={{ width: `${(t.value / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-500">SAMPLE DATA</span>
            </div>
          </div>
        </FadeIn>

        {/* Sector heatmap */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <TrendingUp className="h-4 w-4 text-cyan-400" /> Sector Incident Heatmap
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_SECTOR_HEATMAP.sort((a, b) => b.incidentCount - a.incidentCount).map(s => {
                const intensity = s.incidentCount / maxSector;
                const color = s.riskLevel === 'Very High' ? 'border-red-500/30 bg-red-500/10' :
                              s.riskLevel === 'High' ? 'border-orange-500/30 bg-orange-500/10' :
                              s.riskLevel === 'Moderate' ? 'border-yellow-500/30 bg-yellow-500/10' :
                              'border-green-500/30 bg-green-500/10';
                return (
                  <div key={s.sector} className={`rounded-lg border p-3 ${color}`}>
                    <p className="text-sm font-medium text-slate-600">{s.sector}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-800">{s.incidentCount}</p>
                    <p className="text-[10px] text-slate-500">incidents (sample)</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-900">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${intensity * 100}%`,
                          backgroundColor: s.riskLevel === 'Very High' ? '#ef4444' : s.riskLevel === 'High' ? '#f97316' : s.riskLevel === 'Moderate' ? '#eab308' : '#22c55e'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Data sources */}
        <FadeIn delay={0.15} className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Data Source Attribution</h2>
            <div className="space-y-2">
              {DATA_SOURCES.map(ds => (
                <div key={ds.id} className="flex items-start justify-between rounded-lg bg-navy-800 p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">{ds.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] ${ds.isLive ? 'bg-green-500/10 text-green-400' : 'bg-slate-200/70 text-slate-500'}`}>
                        {ds.isLive ? 'LIVE' : 'HISTORICAL'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{ds.description}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">Licence: {ds.licence} | Coverage: {ds.coverage} | Updated: {ds.lastUpdated}</p>
                  </div>
                  {ds.url && (
                    <a
                      href={ds.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 shrink-0 rounded-lg border border-navy-600 p-1.5 text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-4">
        <DataSourceBanner message="Trend data is illustrative. The Chandigarh crime dataset on data.gov.in should be investigated for real historical data. Never present sample data as real statistics." />
      </div>
    </div>
  );
}
