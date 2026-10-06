import React, { useState } from 'react';
import { Cluster, ActionType, ActionPayload } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { StatusChip, RiskBandBadge } from '../components/StatusChip';
import { GraphStage3D } from '../components/GraphStage3D';
import { ActionModal } from '../components/ActionModal';
import { DataTable, Column } from '../components/DataTable';
import {
  ArrowLeft,
  UserCheck,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Archive,
  Clock,
  Sparkles,
  Building,
  CreditCard,
  Phone,
  FileCheck,
  AlertOctagon,
  Eye,
} from 'lucide-react';

interface ClusterDetailPageProps {
  cluster: Cluster;
  onBack: () => void;
  onTakeAction: (payload: ActionPayload) => void;
}

export const ClusterDetailPage: React.FC<ClusterDetailPageProps> = ({
  cluster,
  onBack,
  onTakeAction,
}) => {
  const [activeActionModal, setActiveActionModal] = useState<ActionType | null>(null);

  const studentColumns: Column<any>[] = [
    {
      key: 'id',
      header: 'Student ID',
      sortable: true,
      width: '100px',
      render: (r) => <span className="font-bold font-display text-ink">{r.id}</span>,
    },
    {
      key: 'name',
      header: 'Applicant Name',
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-medium text-ink">{r.name}</div>
          <div className="text-11 text-steel">{r.course} • {r.year}</div>
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Enrolled Institution',
      sortable: true,
      render: (r) => <span className="text-ink text-12 font-medium">{r.institution}</span>,
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      sortable: true,
      align: 'right',
      width: '120px',
      render: (r) => {
        const isCritical = r.attendance < 30;
        return (
          <span
            className={`font-semibold tabular-nums ${
              isCritical ? 'text-signal' : 'text-ink'
            }`}
          >
            {r.attendance}%
          </span>
        );
      },
    },
    {
      key: 'bank_masked',
      header: 'Bank Account (Masked)',
      render: (r) => (
        <span className="font-mono text-12 bg-mist px-2 py-0.5 rounded text-ink">
          {r.bank_masked}
        </span>
      ),
    },
    {
      key: 'mobile_masked',
      header: 'Mobile Contact',
      render: (r) => (
        <span className="font-mono text-12 text-steel-dark">
          {r.mobile_masked}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Claim Amount',
      sortable: true,
      align: 'right',
      render: (r) => (
        <span className="font-medium tabular-nums text-ink">
          ₹{r.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'doc_hash',
      header: 'Doc Hash / Cert',
      render: (r) => (
        <span className="text-11 text-steel">
          {r.doc_hash}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-steel/20 pb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-14 font-semibold text-petrol hover:text-petrol-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>Back to clusters list</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-12 text-steel">
            Unit of Output: <strong className="text-ink font-semibold">Cluster #{cluster.id}</strong>
          </span>
          <span className="text-12 text-steel">•</span>
          <span className="text-12 text-steel">
            Investigation lead, not evidence
          </span>
        </div>
      </div>

      {/* Cluster Header Toolbar */}
      <div className="p-6 rounded-lg bg-paper-card border border-steel/20 shadow-panel flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-28 text-ink tracking-tight flex items-center gap-2">
              {cluster.id}
            </h1>
            {cluster.is_hero && (
              <span className="px-2 py-0.5 rounded text-11 font-bold bg-signal text-white">
                DEMO HERO
              </span>
            )}
            <StatusChip status={cluster.status} />
            <RiskBandBadge band={cluster.band} />
          </div>

          <h2 className="font-display font-semibold text-16 text-ink">
            {cluster.title}
          </h2>
          <p className="text-12 text-steel max-w-2xl leading-relaxed">
            {cluster.pattern}
          </p>
        </div>

        {/* Risk Meter Gauge */}
        <div className="lg:border-l lg:border-steel/20 lg:pl-6 shrink-0">
          <RiskMeter score={cluster.score} band={cluster.band} size="lg" />
        </div>
      </div>

      {/* Officer Action Bar */}
      <div className="p-4 rounded-lg bg-paper border border-steel/20 shadow-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-12 font-semibold uppercase tracking-wider text-steel">
            Officer Actions:
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Primary Action: Petrol */}
          <button
            onClick={() => setActiveActionModal('assign')}
            className="flex items-center gap-2 px-4 py-2 text-12 font-semibold rounded bg-petrol text-white hover:bg-petrol-hover transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4" strokeWidth={1.5} />
            <span>Assign investigator</span>
          </button>

          <button
            onClick={() => setActiveActionModal('request_documents')}
            className="flex items-center gap-2 px-4 py-2 text-12 font-semibold rounded bg-petrol text-white hover:bg-petrol-hover transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            <span>Request documents</span>
          </button>

          <button
            onClick={() => setActiveActionModal('verify')}
            className="flex items-center gap-2 px-3.5 py-2 text-12 font-semibold rounded bg-sea-subtle text-sea-dark hover:bg-sea-subtle/80 border border-sea/30 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-sea" strokeWidth={1.5} />
            <span>Verify records</span>
          </button>

          {/* Escalate: Signal Outline */}
          <button
            onClick={() => setActiveActionModal('escalate')}
            className="flex items-center gap-2 px-3.5 py-2 text-12 font-semibold rounded bg-signal-subtle text-signal-dark hover:bg-signal-subtle/80 border border-signal/40 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-signal" strokeWidth={1.5} />
            <span>Escalate case</span>
          </button>

          {/* Close: Quiet */}
          <button
            onClick={() => setActiveActionModal('close')}
            className="flex items-center gap-1.5 px-3 py-2 text-12 font-medium text-steel hover:text-ink bg-mist hover:bg-mist-dark rounded transition-colors"
          >
            <Archive className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Close case</span>
          </button>
        </div>
      </div>

      {/* Hero Layout: 3D Graph Stage (60%) + Why Flagged Panel (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60%: 3D Graph Stage */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-16 text-ink">
                3D Entity Relationship Topology
              </h3>
              <p className="text-12 text-steel">
                Drag to orbit, scroll to zoom. Click any node to focus attributes.
              </p>
            </div>
            <span className="text-11 text-steel">
              {cluster.graph.nodes.length} Nodes • {cluster.graph.edges.length} Relationships
            </span>
          </div>

          <GraphStage3D graph={cluster.graph} clusterId={cluster.id} />
        </div>

        {/* Right 40%: Why This Was Flagged */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div>
            <h3 className="font-display font-bold text-16 text-ink">
              Why this was flagged
            </h3>
            <p className="text-12 text-steel">
              Calculated anomaly signals summing to the risk score of {cluster.score}.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-paper-card border border-steel/20 shadow-panel space-y-3">
            {/* Header Points Sum */}
            <div className="flex items-center justify-between pb-3 border-b border-steel/20">
              <span className="text-12 font-semibold text-steel uppercase tracking-wider">
                Signal Rule
              </span>
              <span className="text-12 font-semibold text-steel uppercase tracking-wider">
                Score Impact
              </span>
            </div>

            {/* List of Reasons */}
            <div className="space-y-3">
              {cluster.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-steel/15 bg-paper hover:bg-mist-light transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-14 text-ink flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-signal" />
                      {reason.label}
                    </span>
                    <span className="font-display font-bold text-14 text-signal tabular-nums">
                      +{reason.points} pts
                    </span>
                  </div>
                  <p className="text-12 text-steel mt-1 leading-snug">
                    {reason.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Total Points Sum Visible Check */}
            <div className="pt-3 border-t border-steel/20 flex items-center justify-between">
              <span className="font-display font-bold text-14 text-ink">
                Calculated Anomaly Score:
              </span>
              <div className="flex items-baseline gap-1 font-display font-bold text-20 text-signal tabular-nums">
                <span>{cluster.score}</span>
                <span className="text-12 text-steel font-normal">/ 100</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-mist text-11 text-steel italic border-l-2 border-petrol leading-relaxed">
              Score reflects unusual signals, not the chance of fraud. Flagged clusters indicate high priority for investigative audit by an assigned officer.
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-paper border border-steel/20">
              <span className="text-11 text-steel uppercase font-semibold">Institutions Spanned</span>
              <div className="font-display font-bold text-20 text-ink tabular-nums mt-1">
                {cluster.counts.institutions} Colleges
              </div>
            </div>

            <div className="p-3 rounded-lg bg-paper border border-steel/20">
              <span className="text-11 text-steel uppercase font-semibold">Shared Accounts</span>
              <div className="font-display font-bold text-20 text-ink tabular-nums mt-1">
                {cluster.counts.banks} Account
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Students Table (Masked) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-18 text-ink">
              Linked Student Applications ({cluster.students.length})
            </h3>
            <p className="text-12 text-steel">
              Identifiers masked according to data privacy guidelines. Only last 4 digits visible.
            </p>
          </div>
          <span className="text-11 text-steel font-medium px-2.5 py-1 bg-mist rounded border border-steel/20">
            Synthetic Identifiers
          </span>
        </div>

        <DataTable
          columns={studentColumns}
          data={cluster.students}
          keyField="id"
        />
      </div>

      {/* Case Timeline & Officer History */}
      <div className="p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-petrol" strokeWidth={1.5} />
          <h3 className="font-display font-semibold text-16 text-ink">
            Timeline of Case Actions &amp; Audit Log
          </h3>
        </div>

        <div className="space-y-3">
          {cluster.timeline.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded bg-paper border border-steel/15 text-12"
            >
              <div className="w-2 h-2 rounded-full bg-petrol mt-1.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    {item.action}
                  </span>
                  <span className="text-11 text-steel tabular-nums">
                    {item.time}
                  </span>
                </div>
                <p className="text-ink mt-0.5">
                  {item.note}
                </p>
                <div className="text-[11px] text-steel mt-1">
                  Officer: <strong className="text-steel-dark">{item.officer}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Dialog Modal */}
      <ActionModal
        isOpen={activeActionModal !== null}
        clusterId={cluster.id}
        actionType={activeActionModal}
        onClose={() => setActiveActionModal(null)}
        onSubmit={(payload) => {
          onTakeAction(payload);
          setActiveActionModal(null);
        }}
      />
    </div>
  );
};
