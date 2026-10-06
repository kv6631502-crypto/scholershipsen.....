import React from 'react';
import { SummaryData, Cluster, Institution } from '../types';
import { InstitutionBarMap3D } from '../components/InstitutionBarMap3D';
import { RiskBandBadge } from '../components/StatusChip';
import { ShieldAlert, Users, School, ArrowUpRight, Clock, AlertTriangle, Layers, ChevronRight } from 'lucide-react';

interface OverviewPageProps {
  summary: SummaryData;
  topClusters: Cluster[];
  institutions: Institution[];
  onOpenCluster: (clusterId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  topClusters,
  institutions,
  onOpenCluster,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div>
          <h1 className="font-display font-bold text-28 text-ink tracking-tight">
            National Scholarship Intelligence Overview
          </h1>
          <p className="text-14 text-steel mt-0.5">
            Graph relationship monitoring across student records, institutions, and disbursement rails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-petrol-subtle text-petrol text-12 font-medium border border-petrol/20">
            <span className="w-2 h-2 rounded-full bg-sea animate-pulse" />
            Live Sentinel Engine
          </span>
          <span className="text-12 text-steel font-medium px-2 py-1 bg-mist-dark rounded border border-steel/30">
            Faker `en_IN` (Synthetic Data)
          </span>
        </div>
      </div>

      {/* Headline Numbers: One wide row, unequal widths */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Applications Analyzed (Wide 5 cols) */}
        <div className="md:col-span-5 p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel flex flex-col justify-between">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-12 font-semibold uppercase tracking-wider">
              Total Applications Analyzed
            </span>
            <Users className="w-4 h-4 text-petrol" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display font-bold text-44 text-ink tabular-nums leading-none">
              {summary.applications_analyzed.toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-3 text-12 text-steel">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sea inline-block" />
                <strong className="text-ink font-semibold">{summary.bands.normal.toLocaleString()}</strong> Normal (89.4%)
              </span>
              <span>•</span>
              <span>9,200 Unique Students</span>
            </div>
          </div>
        </div>

        {/* Review Required (3 cols) */}
        <div className="md:col-span-3 p-5 rounded-lg bg-paper-card border border-amber/30 shadow-panel flex flex-col justify-between bg-gradient-to-b from-paper-card to-amber-subtle/20">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-12 font-semibold uppercase tracking-wider text-amber-dark">
              Review Required
            </span>
            <AlertTriangle className="w-4 h-4 text-amber" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display font-bold text-44 text-amber-dark tabular-nums leading-none">
              {summary.bands.review.toLocaleString()}
            </div>
            <div className="text-12 text-steel mt-3">
              Score 40–69 • Secondary verification queue
            </div>
          </div>
        </div>

        {/* High-Risk Applications (4 cols) */}
        <div className="md:col-span-4 p-5 rounded-lg bg-paper-card border border-signal/30 shadow-panel flex flex-col justify-between bg-gradient-to-b from-paper-card to-signal-subtle/30">
          <div className="flex items-center justify-between text-steel mb-2">
            <div className="flex items-center gap-2">
              <span className="text-12 font-semibold uppercase tracking-wider text-signal-dark">
                High-Risk Applications
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-signal text-white">
                PRIORITY
              </span>
            </div>
            <ShieldAlert className="w-4 h-4 text-signal" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-44 text-signal tabular-nums leading-none">
                {summary.bands.high.toLocaleString()}
              </span>
              <span className="text-14 font-medium text-steel">
                across {summary.clusters_count.high_risk} clusters
              </span>
            </div>
            <div className="text-12 text-steel mt-3 flex items-center justify-between">
              <span>Convergence rings &amp; ghost surges</span>
              <button
                onClick={() => onNavigateTab('clusters')}
                className="text-petrol font-semibold hover:underline inline-flex items-center text-12"
              >
                Inspect list <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: 3D Institution Map (60%) + Top Clusters (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Institution Surge Map (60% width = 7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-20 text-ink">
                3D Institution Volume &amp; Surge Topology
              </h2>
              <p className="text-12 text-steel">
                Extruded bars indicate application volume relative to active capacity. Bars &gt; 3x turn signal red.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('institutions')}
              className="text-12 font-semibold text-petrol hover:underline inline-flex items-center gap-1"
            >
              All 60 institutions <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <InstitutionBarMap3D
            institutions={institutions}
            onSelectInstitution={(inst) => {
              onNavigateTab('institutions');
            }}
          />
        </div>

        {/* Top Flagged Clusters List (40% width = 5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-20 text-ink">
                Priority Anomaly Clusters
              </h2>
              <p className="text-12 text-steel">
                Multi-signal convergence scored by explainable rules engine.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('clusters')}
              className="text-12 font-semibold text-petrol hover:underline inline-flex items-center gap-1"
            >
              View all 12 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {topClusters.slice(0, 5).map((cluster) => {
              const isHero = cluster.id === 'CL-104';
              return (
                <div
                  key={cluster.id}
                  onClick={() => onOpenCluster(cluster.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer card-tilt ${
                    isHero
                      ? 'bg-paper-card border-signal/40 shadow-panel ring-1 ring-signal/20'
                      : 'bg-paper border-steel/20 hover:border-petrol/40 hover:bg-paper-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-16 text-ink">
                        {cluster.id}
                      </span>
                      {isHero && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-signal text-white">
                          DEMO HERO
                        </span>
                      )}
                      <RiskBandBadge band={cluster.band} />
                    </div>

                    <div className="flex items-center gap-1.5 font-display font-bold text-16 tabular-nums">
                      <span className={cluster.score >= 70 ? 'text-signal' : 'text-amber-dark'}>
                        {cluster.score}
                      </span>
                      <span className="text-11 text-steel font-normal">/100</span>
                    </div>
                  </div>

                  <p className="text-12 text-ink font-medium mt-1 line-clamp-1">
                    {cluster.title}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-steel/15 flex items-center justify-between text-11 text-steel">
                    <div className="flex items-center gap-3">
                      <span><strong>{cluster.counts.students}</strong> Linked students</span>
                      <span>•</span>
                      <span><strong>{cluster.counts.institutions}</strong> Institutions</span>
                    </div>
                    <span className="text-petrol font-semibold inline-flex items-center">
                      Inspect 3D graph &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Officer Activity Audit Trail */}
      <div className="p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-petrol" strokeWidth={1.5} />
            <h3 className="font-display font-semibold text-16 text-ink">
              Recent Officer Case Actions &amp; Audit Trail
            </h3>
          </div>
          <span className="text-12 text-steel">
            Human-in-the-loop accountability log
          </span>
        </div>

        <div className="divide-y divide-steel/15">
          {summary.recent_activities.map((item, idx) => (
            <div key={idx} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-12">
              <div className="flex items-start md:items-center gap-3">
                <span className="font-semibold text-petrol min-w-[70px]">
                  {item.action}
                </span>
                <span className="font-medium text-ink bg-mist px-2 py-0.5 rounded text-11">
                  {item.cluster_id}
                </span>
                <span className="text-ink">
                  {item.note}
                </span>
              </div>

              <div className="flex items-center gap-4 text-steel text-11 shrink-0 ml-auto md:ml-0">
                <span>By {item.officer}</span>
                <span>•</span>
                <span className="tabular-nums">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
