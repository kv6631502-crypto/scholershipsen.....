import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { SummaryData, Cluster, Institution, ActionPayload } from './types';
import { OverviewPage } from './pages/OverviewPage';
import { ClustersPage } from './pages/ClustersPage';
import { ClusterDetailPage } from './pages/ClusterDetailPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { CasesPage } from './pages/CasesPage';
import { DataPage } from './pages/DataPage';
import { ScanPage } from './pages/ScanPage';
import { FairnessPage } from './pages/FairnessPage';
import { AuditPage } from './pages/AuditPage';
import { Toast, ToastMessage } from './components/Toast';
import { StyleguideModal } from './components/StyleguideModal';
import { DemoWalkthrough, DEMO_STEPS } from './components/DemoWalkthrough';
import {
  LayoutDashboard,
  GitFork,
  Building2,
  Briefcase,
  Database,
  Sparkles,
  Palette,
  Shield,
  FileUp,
  Scale,
  Lock,
  ChevronRight,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedClusterId, setSelectedClusterId] = useState<string>('CL-104');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [csvClusters, setCsvClusters] = useState<Cluster[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isStyleguideOpen, setIsStyleguideOpen] = useState(false);

  // Demo walkthrough mode
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [demoStep, setDemoStep] = useState(1);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(true);

  // Load Initial Data via typed api layer
  useEffect(() => {
    async function loadData() {
      const [sum, cls, ccls, inst, raw] = await Promise.all([
        api.getSummary(),
        api.getClusters(),
        api.getCsvClusters(),
        api.getInstitutions(),
        api.getRawStudents(),
      ]);
      setSummary(sum);
      setClusters(cls);
      setCsvClusters(ccls);
      setInstitutions(inst);
      setRawStudents(raw);
    }
    loadData();
  }, []);

  const addToast = (type: 'success' | 'alert', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleOpenCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('cluster-detail');
  };

  const handleTakeAction = async (clusterId: string, payload: ActionPayload) => {
    const res = await api.takeAction(clusterId, payload);
    if (res.success) {
      const updated = await api.getClusters();
      const updatedCsv = await api.getCsvClusters();
      setClusters(updated);
      setCsvClusters(updatedCsv);

      const actionLabels: Record<string, string> = {
        verify: 'Records verified',
        assign: `Investigator assigned: ${payload.assignee || 'Officer on duty'}`,
        request_documents: 'Documents requested from institution',
        escalate: 'Case escalated to Anti-Corruption Desk',
        close: 'Case closed and filed in audit archive',
      };

      addToast(
        payload.action === 'escalate' ? 'alert' : 'success',
        actionLabels[payload.action] || 'Action recorded',
        payload.note
      );
    }
  };

  // Demo Step Controller
  const handleGoToDemoStep = (stepNumber: number) => {
    setDemoStep(stepNumber);
    const stepObj = DEMO_STEPS[stepNumber - 1];
    if (stepObj) {
      if (stepObj.targetTab === 'clusters') {
        setActiveTab('clusters');
      } else if (stepObj.targetTab === 'cluster-detail') {
        setSelectedClusterId('CL-104');
        setActiveTab('cluster-detail');
      } else {
        setActiveTab('overview');
      }
    }
  };

  const handleAddStudent = async (studentData: any) => {
    const res = await api.addStudent(studentData);
    if (res.success) {
      setRawStudents(await api.getRawStudents());
      setCsvClusters([...res.allClusters]);

      if (res.matchedCluster) {
        addToast(
          'alert',
          `Convergence Alert: ${res.matchedCluster.id}`,
          `Applicant ${studentData.Student_Name} matched existing cluster signals (Risk: ${res.matchedCluster.score}/100)`
        );
      } else {
        addToast(
          'success',
          'Beneficiary Record Ingested',
          `Verified independent record saved for ${studentData.Student_Name} (Score: 15/100)`
        );
      }
    }
    return res;
  };

  const handleClusterInjected = (newCluster: Cluster) => {
    setClusters((prev) => [newCluster, ...prev]);
    addToast(
      'alert',
      `Red Team Pattern Injected: ${newCluster.id}`,
      `Simulated adversarial ring detected and rendered in live graph (Score: ${newCluster.score}/100)`
    );
  };

  // Current cluster for detail view
  const currentCluster =
    clusters.find((c) => c.id.toLowerCase() === selectedClusterId.toLowerCase()) ||
    csvClusters.find((c) => c.id.toLowerCase() === selectedClusterId.toLowerCase()) ||
    clusters[0];

  return (
    <div className="flex min-h-screen bg-mist text-ink font-sans selection:bg-petrol-subtle selection:text-petrol">
      {/* 1. Left Rail (Harbor) - Physical rail aesthetic */}
      <aside className="w-64 bg-harbor border-r border-harbor-border shadow-elevated flex flex-col justify-between shrink-0 z-30 sticky top-0 h-screen select-none harbor-scroll">
        <div>
          {/* Brand & Crest */}
          <div className="p-5 border-b border-harbor-border/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-petrol flex items-center justify-center text-paper border border-petrol-light shadow-sm">
                <Shield className="w-5 h-5 text-paper" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="font-display font-bold text-16 text-white tracking-tight leading-none">
                  Scholarship Sentinel
                </h1>
                <p className="text-[11px] text-steel-light mt-1 font-medium tracking-wide uppercase">
                  Anomaly Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items (Sections from SCHOLARSHIP_SENTINEL_FINAL.md Section 7.5) */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('clusters')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'clusters' || activeTab === 'cluster-detail'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <GitFork className="w-4 h-4" strokeWidth={1.5} />
                <span>Clusters</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-signal/30 text-signal font-bold">
                {clusters.length}
              </span>
            </button>

            {/* Dedicated Scan Custom CSV / Excel Section */}
            <button
              onClick={() => setActiveTab('scan')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'scan'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileUp className="w-4 h-4" strokeWidth={1.5} />
                <span>Scan Custom File</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber/30 text-amber font-bold">
                NEW
              </span>
            </button>

            <button
              onClick={() => setActiveTab('institutions')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'institutions'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" strokeWidth={1.5} />
                <span>Institutions</span>
              </div>
              <span className="text-[11px] text-steel-light tabular-nums">
                {institutions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cases')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'cases'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <Briefcase className="w-4 h-4" strokeWidth={1.5} />
              <span>Cases</span>
            </button>

            <button
              onClick={() => setActiveTab('fairness')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'fairness'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <Scale className="w-4 h-4" strokeWidth={1.5} />
              <span>Fairness Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <span>DB, Audit &amp; Rails</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sea/25 text-sea-light font-bold">
                API
              </span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded text-13 font-medium transition-colors ${
                activeTab === 'data'
                  ? 'bg-petrol text-white shadow-sm font-semibold'
                  : 'text-steel-light hover:text-white hover:bg-harbor-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4" strokeWidth={1.5} />
                <span>Data Explorer</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sea/20 text-sea font-medium">
                Mixed
              </span>
            </button>
          </nav>

          {/* Quick Hero Access */}
          <div className="px-3 py-2">
            <button
              onClick={() => handleOpenCluster('CL-104')}
              className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                activeTab === 'cluster-detail' && selectedClusterId === 'CL-104'
                  ? 'bg-harbor-surface border-signal shadow-sm'
                  : 'bg-harbor-muted border-harbor-border hover:border-steel/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-12 text-white">
                  Demo Hero: CL-104
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-signal text-white">
                  Score 87
                </span>
              </div>
              <p className="text-[11px] text-steel-light mt-0.5 line-clamp-1">
                Shared bank BA103 &amp; Mobile
              </p>
            </button>
          </div>
        </div>

        {/* Rail Footer Controls */}
        <div className="p-4 border-t border-harbor-border space-y-2.5">
          {/* Demo Mode Toggle */}
          <div className="p-2.5 rounded-lg bg-harbor-surface border border-harbor-border text-12">
            <div className="flex items-center justify-between mb-1">
              <span className="text-paper font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber" />
                Demo Script
              </span>
              <button
                onClick={() => setIsWalkthroughOpen(!isWalkthroughOpen)}
                className="text-[11px] text-steel-light hover:text-white underline"
              >
                {isWalkthroughOpen ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-[11px] text-steel-light leading-snug">
              2-min walkthrough with target cluster CL-104.
            </p>
          </div>

          {/* Styleguide Button */}
          <button
            onClick={() => setIsStyleguideOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-harbor-surface/60 border border-harbor-border text-steel-light hover:text-white hover:bg-harbor-surface transition-colors text-11"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-sea" />
              <span>Design System Tokens</span>
            </div>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* User Profile */}
          <div className="pt-2 border-t border-harbor-border flex items-center justify-between text-11 text-steel-light">
            <div>
              <div className="text-white font-medium">Rajesh Verma, IAS</div>
              <div className="text-[10px] text-steel-light">Principal Audit Officer</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-sea" title="Secure Session Active" />
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area on Mist */}
      <main className="flex-1 min-w-0 p-8 max-w-7xl mx-auto">
        {summary ? (
          <>
            {activeTab === 'overview' && (
              <OverviewPage
                summary={summary}
                topClusters={clusters}
                institutions={institutions}
                onOpenCluster={handleOpenCluster}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onClusterInjected={handleClusterInjected}
              />
            )}

            {activeTab === 'clusters' && (
              <ClustersPage
                clusters={clusters}
                csvClusters={csvClusters}
                onOpenCluster={handleOpenCluster}
              />
            )}

            {activeTab === 'cluster-detail' && currentCluster && (
              <ClusterDetailPage
                cluster={currentCluster}
                onBack={() => setActiveTab('clusters')}
                onTakeAction={(payload) => handleTakeAction(currentCluster.id, payload)}
              />
            )}

            {activeTab === 'scan' && (
              <ScanPage
                onOpenCluster={handleOpenCluster}
                onClusterScanned={(scannedClusters) => {
                  setClusters((prev) => [...scannedClusters, ...prev]);
                }}
              />
            )}

            {activeTab === 'institutions' && (
              <InstitutionsPage
                institutions={institutions}
                onSelectInstitution={() => {}}
              />
            )}

            {activeTab === 'cases' && (
              <CasesPage
                clusters={clusters}
                onOpenCluster={handleOpenCluster}
                onTakeAction={handleTakeAction}
              />
            )}

            {activeTab === 'fairness' && <FairnessPage />}

            {activeTab === 'audit' && <AuditPage />}

            {activeTab === 'data' && (
              <DataPage
                rawStudents={rawStudents}
                csvClusters={csvClusters}
                onOpenCluster={handleOpenCluster}
                onAddStudent={handleAddStudent}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-petrol border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="font-display font-semibold text-16 text-ink">
                Loading Sentinel Intelligence Graph...
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Design System Styleguide Modal */}
      <StyleguideModal isOpen={isStyleguideOpen} onClose={() => setIsStyleguideOpen(false)} />

      {/* 2-Minute Demo Script Walkthrough Banner */}
      <DemoWalkthrough
        isOpen={isWalkthroughOpen}
        currentStep={demoStep}
        onClose={() => setIsWalkthroughOpen(false)}
        onGoToStep={handleGoToDemoStep}
      />
    </div>
  );
}

export default App;
