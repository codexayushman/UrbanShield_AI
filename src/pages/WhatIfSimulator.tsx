import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FadeIn from '@/components/FadeIn';
import { RiskBadge } from '@/components/RiskBadge';
import { DataSourceBanner } from '@/components/DataLabel';
import { RISK_INDICATORS } from '@/config/scoring';
import { FlaskConical, Lightbulb, Building2, Route, TrendingDown, Info, Play, RotateCcw } from 'lucide-react';

interface ScenarioConfig {
  lightingImprovement: number;
  facilityAddition: number;
  patrolIncrease: number;
  roadMaintenance: number;
}

const baselineScore = 55;

export default function WhatIfSimulator() {
  const [config, setConfig] = useState<ScenarioConfig>({
    lightingImprovement: 0,
    facilityAddition: 0,
    patrolIncrease: 0,
    roadMaintenance: 0,
  });
  const [hasRun, setHasRun] = useState(false);

  const adjustments: { key: keyof ScenarioConfig; label: string; icon: typeof Lightbulb; description: string; max: number; unit: string }[] = [
    { key: 'lightingImprovement', label: 'Lighting Improvement', icon: Lightbulb, description: 'Install or repair street lighting in poorly lit sectors', max: 100, unit: '%' },
    { key: 'facilityAddition', label: 'New Facilities', icon: Building2, description: 'Add police stations, hospitals, or emergency kiosks', max: 10, unit: ' facilities' },
    { key: 'patrolIncrease', label: 'Patrol Coverage', icon: Route, description: 'Increase patrol frequency and coverage area', max: 100, unit: '%' },
    { key: 'roadMaintenance', label: 'Road Maintenance', icon: TrendingDown, description: 'Proactive road hazard repair and inspection', max: 100, unit: '%' },
  ];

  const runSimulation = () => {
    setHasRun(true);
  };

  const reset = () => {
    setConfig({ lightingImprovement: 0, facilityAddition: 0, patrolIncrease: 0, roadMaintenance: 0 });
    setHasRun(false);
  };

  // Calculate projected score — this is a DEMO model, not a validated prediction
  const lightingReduction = config.lightingImprovement * 0.08;
  const facilityReduction = config.facilityAddition * 1.5;
  const patrolReduction = config.patrolIncrease * 0.06;
  const roadReduction = config.roadMaintenance * 0.05;
  const totalReduction = lightingReduction + facilityReduction + patrolReduction + roadReduction;
  const projectedScore = Math.max(0, Math.round(baselineScore - totalReduction));
  const riskReduction = baselineScore - projectedScore;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="What-If Simulator"
        description="Model hypothetical improvements to lighting, facility coverage, patrols, and road maintenance. See projected risk reduction."
        icon={<FlaskConical className="h-5 w-5 text-cyan-400" />}
        dataBanner="Projections are SIMULATED estimates based on a demo model. They are NOT verified outcomes or predictions. Real impact requires validated data, longitudinal studies, and expert analysis."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Controls */}
        <FadeIn className="lg:col-span-2">
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">Scenario Configuration</h2>

            {/* Baseline */}
            <div className="mb-4 rounded-lg border border-navy-700 bg-navy-800 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Baseline Risk Score (Average)</span>
                <RiskBadge category="Moderate" score={baselineScore} />
              </div>
              <p className="mt-1 text-[10px] text-slate-600">Current demo average across all sectors</p>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {adjustments.map(adj => {
                const Icon = adj.icon;
                return (
                  <div key={adj.key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-slate-600">{adj.label}</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-400">+{config[adj.key]}{adj.unit}</span>
                    </div>
                    <p className="mt-0.5 mb-1.5 text-xs text-slate-500">{adj.description}</p>
                    <input
                      type="range"
                      min={0}
                      max={adj.max}
                      value={config[adj.key]}
                      onChange={e => setConfig(prev => ({ ...prev, [adj.key]: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={runSimulation}
                className="flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-5 py-2.5 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/30"
              >
                <Play className="h-4 w-4" /> Run Simulation
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-lg border border-navy-600 bg-navy-800 px-5 py-2.5 text-sm text-slate-500 hover:bg-navy-700"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Results */}
        <FadeIn delay={0.05}>
          <div className="space-y-4">
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">Projected Impact</h2>

              {hasRun ? (
                <>
                  <div className="rounded-lg bg-navy-800 p-4 text-center">
                    <p className="text-xs text-slate-500">Projected Risk Score</p>
                    <p className={`mt-1 text-4xl font-bold ${riskReduction > 20 ? 'text-green-400' : riskReduction > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                      {projectedScore}
                    </p>
                    <div className="mt-2"><RiskBadge category={projectedScore < 30 ? 'Low' : projectedScore < 60 ? 'Moderate' : projectedScore < 80 ? 'High' : 'Very High'} /></div>
                  </div>

                  <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
                    <p className="text-xs text-slate-500">Risk Reduction</p>
                    <p className="text-2xl font-bold text-green-400">-{riskReduction} points</p>
                    <p className="text-[10px] text-slate-600">({((riskReduction / baselineScore) * 100).toFixed(0)}% from baseline)</p>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {riskReduction > 0 && (
                      <>
                        <p className="text-xs font-semibold text-slate-500">Contributing Factors:</p>
                        {config.lightingImprovement > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Lighting: -{lightingReduction.toFixed(1)}</span>
                            <span className="text-green-400">{config.lightingImprovement}% improvement</span>
                          </div>
                        )}
                        {config.facilityAddition > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Facilities: -{facilityReduction.toFixed(1)}</span>
                            <span className="text-green-400">+{config.facilityAddition} new</span>
                          </div>
                        )}
                        {config.patrolIncrease > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Patrols: -{patrolReduction.toFixed(1)}</span>
                            <span className="text-green-400">{config.patrolIncrease}% increase</span>
                          </div>
                        )}
                        {config.roadMaintenance > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Roads: -{roadReduction.toFixed(1)}</span>
                            <span className="text-green-400">{config.roadMaintenance}% coverage</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-navy-800 p-8 text-center">
                  <FlaskConical className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                  <p className="text-xs text-slate-500">Adjust the sliders and click "Run Simulation" to see projected impact</p>
                </div>
              )}
            </div>

            {/* Risk indicators reference */}
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Info className="h-4 w-4 text-cyan-400" /> Risk Indicators
              </h2>
              <div className="space-y-1.5">
                {RISK_INDICATORS.map(ind => (
                  <div key={ind.key} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{ind.label}</span>
                      <span className="text-slate-600">Weight: {(ind.weight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-4">
        <DataSourceBanner message="The What-If Simulator uses a DEMO model with assumed linear relationships. Real impact assessment requires validated data, longitudinal studies, expert domain knowledge, and peer-reviewed methodology. Projections must NEVER be presented as verified outcomes." />
      </div>
    </div>
  );
}
