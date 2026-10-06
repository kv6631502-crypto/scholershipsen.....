import React from 'react';
import { RiskMeter } from './RiskMeter';
import { StatusChip, RiskBandBadge } from './StatusChip';
import { DataTable } from './DataTable';
import { EmptyState } from './EmptyState';
import { X, CheckCircle, ShieldAlert, FileText, UserCheck, Palette } from 'lucide-react';

interface StyleguideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StyleguideModal: React.FC<StyleguideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const demoData = [
    { id: 'CL-104', score: 87, band: 'high', status: 'open', desc: 'Hero cross-institution ring' },
    { id: 'CL-107', score: 82, band: 'high', status: 'assigned', desc: 'Ghost institution surge' },
    { id: 'CL-DEC-02', score: 45, band: 'review', status: 'documents_requested', desc: 'Shared parent contact decoy' },
    { id: 'CL-DEC-01', score: 35, band: 'normal', status: 'closed', desc: 'Family sibling pair' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-paper border border-steel/20 rounded-lg shadow-floating max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-steel/20 bg-paper-card sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-petrol text-white">
              <Palette className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display font-bold text-20 text-ink">
                Sentinel Design System Token &amp; Component Audit
              </h2>
              <p className="text-12 text-steel">
                Strict adherence to DESIGN.md — Zero violet/purple hues across all elements.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-steel hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Color Tokens Palette */}
          <div>
            <h3 className="font-display font-semibold text-16 text-ink mb-3">
              1. Curated Mineral Color Tokens
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-3 text-center text-11">
              <div className="p-3 rounded bg-mist border border-steel/20">
                <span className="font-bold text-ink block">mist</span>
                <span className="text-steel font-mono">#E6EDEF</span>
              </div>
              <div className="p-3 rounded bg-paper border border-steel/20">
                <span className="font-bold text-ink block">paper</span>
                <span className="text-steel font-mono">#F6F9F9</span>
              </div>
              <div className="p-3 rounded bg-ink text-white">
                <span className="font-bold block">ink</span>
                <span className="text-steel-light font-mono">#12262E</span>
              </div>
              <div className="p-3 rounded bg-steel text-white">
                <span className="font-bold block">steel</span>
                <span className="text-paper font-mono">#6B8794</span>
              </div>
              <div className="p-3 rounded bg-petrol text-white">
                <span className="font-bold block">petrol</span>
                <span className="text-petrol-subtle font-mono">#0F4C5C</span>
              </div>
              <div className="p-3 rounded bg-harbor text-white">
                <span className="font-bold block">harbor</span>
                <span className="text-steel-light font-mono">#0A2A33</span>
              </div>
              <div className="p-3 rounded bg-signal text-white">
                <span className="font-bold block">signal</span>
                <span className="text-signal-subtle font-mono">#E0452B</span>
              </div>
              <div className="p-3 rounded bg-amber text-ink">
                <span className="font-bold block">amber</span>
                <span className="text-ink font-mono">#E8A02A</span>
              </div>
              <div className="p-3 rounded bg-sea text-white">
                <span className="font-bold block">sea</span>
                <span className="text-sea-subtle font-mono">#2F9E8F</span>
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div>
            <h3 className="font-display font-semibold text-16 text-ink mb-3">
              2. Typography Scale (Bricolage Grotesque &amp; Public Sans)
            </h3>
            <div className="space-y-2 p-4 bg-paper-card rounded border border-steel/20">
              <div className="text-44 font-display font-bold text-ink leading-none">
                44px Display Headings (10,000 Apps)
              </div>
              <div className="text-28 font-display font-bold text-ink">
                28px Page Titles (Cluster Explorer)
              </div>
              <div className="text-20 font-display font-semibold text-ink">
                20px Section Headlines
              </div>
              <div className="text-16 font-medium text-ink">
                16px Subheadings &amp; Card Titles
              </div>
              <div className="text-14 text-steel leading-relaxed">
                14px Standard UI Body copy with 65-character line length limit.
              </div>
              <div className="text-12 text-steel">
                12px Captions, metadata badges, and secondary table labels.
              </div>
            </div>
          </div>

          {/* Risk Meters */}
          <div>
            <h3 className="font-display font-semibold text-16 text-ink mb-3">
              3. Risk Meter Gauges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-paper-card rounded border border-steel/20">
              <RiskMeter score={87} band="high" size="md" />
              <RiskMeter score={45} band="review" size="md" />
              <RiskMeter score={22} band="normal" size="md" />
            </div>
          </div>

          {/* Status Chips and Badges */}
          <div>
            <h3 className="font-display font-semibold text-16 text-ink mb-3">
              4. Status Chips &amp; Risk Badges
            </h3>
            <div className="flex flex-wrap gap-3 items-center p-4 bg-paper-card rounded border border-steel/20">
              <RiskBandBadge band="high" />
              <RiskBandBadge band="review" />
              <RiskBandBadge band="normal" />
              <span className="text-steel">|</span>
              <StatusChip status="open" />
              <StatusChip status="assigned" />
              <StatusChip status="documents_requested" />
              <StatusChip status="escalated" />
              <StatusChip status="closed" />
            </div>
          </div>

          {/* Buttons */}
          <div>
            <h3 className="font-display font-semibold text-16 text-ink mb-3">
              5. Officer Action Buttons
            </h3>
            <div className="flex flex-wrap gap-3 items-center p-4 bg-paper-card rounded border border-steel/20">
              <button className="px-4 py-2 text-14 font-semibold rounded bg-petrol text-white hover:bg-petrol-hover transition-colors">
                Primary (Petrol) Action
              </button>
              <button className="px-4 py-2 text-14 font-semibold rounded bg-signal-subtle text-signal-dark border border-signal/40 hover:bg-signal-subtle/80 transition-colors">
                Escalate (Signal Outline)
              </button>
              <button className="px-4 py-2 text-14 font-semibold rounded bg-sea-subtle text-sea-dark border border-sea/30">
                Verify (Sea Accent)
              </button>
              <button className="px-4 py-2 text-14 font-medium rounded bg-mist text-steel hover:text-ink">
                Close (Quiet)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
