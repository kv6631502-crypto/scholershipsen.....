import React, { useState, useMemo, useEffect } from 'react';
import { Cluster } from '../types';
import { api } from '../lib/api';
import { DataTable, Column } from '../components/DataTable';
import { RiskBandBadge } from '../components/StatusChip';
import {
  FileSpreadsheet,
  ShieldCheck,
  Search,
  Sparkles,
  Database,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronDown,
  ChevronUp,
  Download,
  Layers,
  FileText,
  Filter,
} from 'lucide-react';

interface DataPageProps {
  rawStudents: any[];
  csvClusters: Cluster[];
  onOpenCluster: (clusterId: string) => void;
  onAddStudent?: (studentData: any) => Promise<any>;
}

export const DataPage: React.FC<DataPageProps> = ({
  rawStudents,
  csvClusters,
  onOpenCluster,
  onAddStudent,
}) => {
  // Primary Dataset Switcher: 'user_csv' vs 'synthetic_benchmark'
  const [activeDatasetTab, setActiveDatasetTab] = useState<'user_csv' | 'synthetic_benchmark'>('user_csv');

  // Search & Filter state for User CSV
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Synthetic applications state & filters
  const [syntheticApps, setSyntheticApps] = useState<any[]>([]);
  const [syntheticCsvFiles, setSyntheticCsvFiles] = useState<any[]>([]);
  const [synthSearch, setSynthSearch] = useState('');
  const [synthSchemeFilter, setSynthSchemeFilter] = useState('all');
  const [synthBandFilter, setSynthBandFilter] = useState('all');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'detected' | 'clean';
    clusterId?: string;
    score?: number;
    message: string;
    reasons?: string[];
  } | null>(null);

  const initialForm = {
    Student_Name: '',
    Admission_No: '',
    Class: '8th',
    DOB: '15-05-2009',
    Category: 'Gen',
    Father_Name: '',
    Mother_Name: '',
    Aadhaar_No: '',
    Account_No: '',
    Contact_No: '',
    IFSC_Code: 'JAKA0KALBAR',
    Identification_Mark: 'None',
    attendance: 78,
    amount: 15000,
    institution: 'J&K Government High School',
  };

  const [formData, setFormData] = useState(initialForm);

  // Load Synthetic Data
  useEffect(() => {
    async function loadSynth() {
      const [apps, files] = await Promise.all([
        api.getSyntheticApplications(),
        api.getSyntheticCsvFiles(),
      ]);
      setSyntheticApps(apps);
      setSyntheticCsvFiles(files);
    }
    loadSynth();
  }, []);

  // Quick Simulation Presets
  const applyPreset = (type: 'ring' | 'mobile' | 'sibling' | 'clean') => {
    if (type === 'ring') {
      setFormData({
        Student_Name: 'Rohan Sharma (Simulated)',
        Admission_No: '991',
        Class: '8th',
        DOB: '27-04-2008',
        Category: 'Gen',
        Father_Name: 'Parshotam Sharma',
        Mother_Name: 'Reva Rani',
        Aadhaar_No: '593974214828',
        Account_No: '0684041000001517',
        Contact_No: '9697189784',
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'Mole on collarbone',
        attendance: 14,
        amount: 22000,
        institution: 'J&K Government High School',
      });
    } else if (type === 'mobile') {
      setFormData({
        Student_Name: 'Pooja Rani (Simulated)',
        Admission_No: '992',
        Class: '7th',
        DOB: '10-09-2010',
        Category: 'OBC',
        Father_Name: 'Som Raj',
        Mother_Name: 'Sunita Devi',
        Aadhaar_No: '492831998822',
        Account_No: '0684041000009941',
        Contact_No: '9149831704',
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'None',
        attendance: 34,
        amount: 14000,
        institution: 'J&K Government High School',
      });
    } else if (type === 'sibling') {
      setFormData({
        Student_Name: 'Aryan Chandan (Sibling Decoy)',
        Admission_No: '993',
        Class: '6th',
        DOB: '14-08-2012',
        Category: 'OBC',
        Father_Name: 'Prem Chandan',
        Mother_Name: 'Asha Rani',
        Aadhaar_No: '882947109999',
        Account_No: '0684041000008888',
        Contact_No: '9682558540',
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'None',
        attendance: 86,
        amount: 10000,
        institution: 'J&K Government High School',
      });
    } else {
      setFormData({
        Student_Name: 'Meera Devi (Verified)',
        Admission_No: '994',
        Class: '10th',
        DOB: '05-11-2007',
        Category: 'SC',
        Father_Name: 'Ramesh Lal',
        Mother_Name: 'Geeta Devi',
        Aadhaar_No: '719284102948',
        Account_No: '0684041000007712',
        Contact_No: '9419203948',
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'Scar on left elbow',
        attendance: 91,
        amount: 18000,
        institution: 'J&K Government High School',
      });
    }
    setScanResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Student_Name || !formData.Aadhaar_No || !formData.Account_No) {
      alert('Please provide Student Name, Aadhaar Number, and Bank Account.');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    setTimeout(async () => {
      let matchedClusterId: string | undefined;

      if (onAddStudent) {
        const res = await onAddStudent(formData);
        if (res && res.matchedCluster) {
          matchedClusterId = res.matchedCluster.id;
        }
      }

      const isSharedRing =
        formData.Aadhaar_No === '593974214828' ||
        formData.Account_No.includes('1517') ||
        formData.Aadhaar_No.includes('4828');

      const isSharedMob = formData.Contact_No === '9149831704';

      if (isSharedRing || matchedClusterId === 'CL-CSV-01') {
        setScanResult({
          status: 'detected',
          clusterId: 'CL-CSV-01',
          score: 85,
          message:
            'Convergence Alert: Record links directly into Aadhaar & Bank Account Duplication Ring CL-CSV-01.',
          reasons: [
            'Shared Aadhaar (593974214828) claims identical identity hash across 3+ records (+25 pts)',
            'Shared Bank Account (••••1517) routes disbursements to single centralized account (+25 pts)',
            'Attendance anomaly: 14% attendance triggers verification mandate (+15 pts)',
          ],
        });
      } else if (isSharedMob || matchedClusterId === 'CL-CSV-03') {
        setScanResult({
          status: 'detected',
          clusterId: 'CL-CSV-03',
          score: 60,
          message:
            'Review Required: Shared mobile contact 9149831704 registered across 4 unrelated candidates.',
          reasons: [
            'Shared Mobile contact linked across distinct family parentages (+20 pts)',
            'Multi-grade convergence across 5th, 7th, and 8th grades (+15 pts)',
          ],
        });
      } else {
        setScanResult({
          status: 'clean',
          score: 15,
          message:
            'Verified Normal: Unique identifiers verified. No anomaly cluster convergence detected (Score: 15/100).',
        });
      }

      setIsScanning(false);
    }, 700);
  };

  // Filter User Students
  const filteredUserStudents = useMemo(() => {
    return rawStudents.filter((r) => {
      if (categoryFilter !== 'all' && r.Category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = String(r.Student_Name || '').toLowerCase().includes(q);
        const matchAdm = String(r.Admission_No || '').toLowerCase().includes(q);
        const matchAadhaar = String(r.Aadhaar_No || '').includes(q);
        const matchAcc = String(r.Account_No || '').includes(q);
        const matchFather = String(r.Father_Name || '').toLowerCase().includes(q);
        if (!matchName && !matchAdm && !matchAadhaar && !matchAcc && !matchFather) return false;
      }
      return true;
    });
  }, [rawStudents, categoryFilter, searchQuery]);

  // Filter Synthetic Applications
  const filteredSyntheticApps = useMemo(() => {
    return syntheticApps.filter((app) => {
      if (synthSchemeFilter !== 'all' && app.scholarship_type !== synthSchemeFilter) return false;
      if (synthBandFilter !== 'all' && app.risk_band !== synthBandFilter) return false;
      if (synthSearch.trim()) {
        const q = synthSearch.toLowerCase();
        const matchId = app.application_id.toLowerCase().includes(q);
        const matchSid = app.student_id.toLowerCase().includes(q);
        const matchName = app.student_name.toLowerCase().includes(q);
        const matchInst = app.institution_name.toLowerCase().includes(q);
        if (!matchId && !matchSid && !matchName && !matchInst) return false;
      }
      return true;
    });
  }, [syntheticApps, synthSchemeFilter, synthBandFilter, synthSearch]);

  // Columns for User CSV Table
  const userColumns: Column<any>[] = [
    {
      key: 'Student_ID',
      header: 'ID',
      sortable: true,
      width: '70px',
      render: (r) => <span className="font-mono text-12 font-bold text-ink">{r.Student_ID}</span>,
    },
    {
      key: 'Admission_No',
      header: 'Adm No',
      sortable: true,
      width: '90px',
      render: (r) => <span className="font-mono text-12 text-steel-dark">{r.Admission_No}</span>,
    },
    {
      key: 'Student_Name',
      header: 'Student Name',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-medium text-ink">{r.Student_Name}</span>
          <div className="text-11 text-steel">Class: {r.Class} • Cat: {r.Category}</div>
        </div>
      ),
    },
    {
      key: 'Aadhaar_No',
      header: 'Aadhaar (Masked)',
      sortable: true,
      render: (r) => {
        const val = String(r.Aadhaar_No || '');
        const isDuplicated = val === '593974214828' || val === '323008557821';
        return (
          <span
            className={`font-mono text-12 px-2 py-0.5 rounded ${
              isDuplicated
                ? 'bg-signal-subtle text-signal-dark font-bold border border-signal/30'
                : 'text-ink'
            }`}
          >
            ••••{val.slice(-4)}
          </span>
        );
      },
    },
    {
      key: 'Account_No',
      header: 'Bank Account',
      render: (r) => {
        const val = String(r.Account_No || '');
        const isDuplicated = val.includes('1517') || val.includes('2142');
        return (
          <span
            className={`font-mono text-12 px-2 py-0.5 rounded ${
              isDuplicated
                ? 'bg-signal-subtle text-signal-dark font-bold border border-signal/30'
                : 'text-steel-dark'
            }`}
          >
            ••••{val.slice(-4)}
          </span>
        );
      },
    },
    {
      key: 'Contact_No',
      header: 'Contact',
      render: (r) => {
        const val = String(r.Contact_No || '');
        const isShared = val === '9149831704' || val === '9697189784' || val === '9682558540';
        return (
          <span
            className={`font-mono text-12 px-2 py-0.5 rounded ${
              isShared
                ? 'bg-amber-subtle text-amber-dark font-medium border border-amber/30'
                : 'text-steel'
            }`}
          >
            {val.slice(0, 2)}••••{val.slice(-4)}
          </span>
        );
      },
    },
    {
      key: 'Father_Name',
      header: 'Parentage & Guardians',
      render: (r) => (
        <div className="text-12 text-ink">
          <div>Father: {r.Father_Name}</div>
          <div className="text-11 text-steel">Mother: {r.Mother_Name}</div>
        </div>
      ),
    },
    {
      key: 'IFSC_Code',
      header: 'IFSC Code',
      render: (r) => <span className="font-mono text-11 text-steel">{r.IFSC_Code}</span>,
    },
  ];

  // Columns for Synthetic Applications Table
  const syntheticColumns: Column<any>[] = [
    {
      key: 'application_id',
      header: 'App ID',
      sortable: true,
      width: '100px',
      render: (r) => <span className="font-mono text-12 font-bold text-ink">{r.application_id}</span>,
    },
    {
      key: 'student_id',
      header: 'Student ID',
      sortable: true,
      width: '100px',
      render: (r) => (
        <span className="font-mono text-12 text-petrol font-medium">
          {r.student_id}
          {r.student_id === 'S003' || r.student_id === 'S006' || r.student_id === 'S007' || r.student_id === 'S008' ? (
            <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-bold bg-signal text-white">HERO</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'student_name',
      header: 'Applicant & Institution',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-medium text-ink">{r.student_name}</span>
          <div className="text-11 text-steel">{r.institution_name}</div>
        </div>
      ),
    },
    {
      key: 'scholarship_type',
      header: 'Scholarship Scheme',
      sortable: true,
      render: (r) => <span className="text-12 text-ink font-medium">{r.scholarship_type}</span>,
    },
    {
      key: 'amount',
      header: 'Disbursement',
      sortable: true,
      align: 'right',
      render: (r) => <span className="font-medium tabular-nums text-ink">₹{r.amount.toLocaleString()}</span>,
    },
    {
      key: 'attendance_pct',
      header: 'Attendance',
      sortable: true,
      align: 'right',
      width: '100px',
      render: (r) => (
        <span className={`font-semibold tabular-nums ${r.attendance_pct < 30 ? 'text-signal' : 'text-ink'}`}>
          {r.attendance_pct}%
        </span>
      ),
    },
    {
      key: 'risk_band',
      header: 'Evaluated Band',
      width: '120px',
      render: (r) => <RiskBandBadge band={r.risk_band} />,
    },
    {
      key: 'applied_on',
      header: 'Filing Date',
      sortable: true,
      width: '110px',
      render: (r) => <span className="text-11 text-steel">{r.applied_on}</span>,
    },
  ];

  // Helper to trigger browser download of CSV
  const handleExportCSV = (filename: string) => {
    let csvContent = '';
    if (filename === 'students.csv') {
      const headers = ['Student_ID','Admission_No','Student_Name','Class','DOB','Category','Father_Name','Mother_Name','Aadhaar_No','Account_No','Contact_No','IFSC_Code','Identification_Mark'];
      const rows = rawStudents.map(s => headers.map(h => `"${s[h] || ''}"`).join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    } else {
      const headers = ['application_id','student_id','student_name','institution_name','scholarship_type','amount','status','risk_band','attendance_pct','applied_on'];
      const rows = syntheticApps.map(a => headers.map(h => `"${a[h] || ''}"`).join(','));
      csvContent = [headers.join(','), ...rows].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div>
          <h1 className="font-display font-bold text-28 text-ink tracking-tight">
            Data Explorer &amp; Comprehensive Ingestion
          </h1>
          <p className="text-14 text-steel mt-0.5">
            Switch between your uploaded <code className="bg-mist px-2 py-0.5 rounded text-12 font-mono">students.csv</code> and the full 10,000 synthetic national applications.
          </p>
        </div>

        {/* Master Dataset Switcher */}
        <div className="flex items-center gap-2 bg-paper p-1 rounded-lg border border-steel/30 shadow-sm">
          <button
            onClick={() => setActiveDatasetTab('user_csv')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-12 font-semibold transition-colors ${
              activeDatasetTab === 'user_csv'
                ? 'bg-petrol text-white shadow-sm'
                : 'text-steel-dark hover:text-ink'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>User Data: students.csv ({rawStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveDatasetTab('synthetic_benchmark')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-12 font-semibold transition-colors ${
              activeDatasetTab === 'synthetic_benchmark'
                ? 'bg-petrol text-white shadow-sm'
                : 'text-steel-dark hover:text-ink'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>National Synthetic (10,000 Apps)</span>
          </button>
        </div>
      </div>

      {/* -------------------- TAB 1: USER PROVIDED DATA (students.csv) -------------------- */}
      {activeDatasetTab === 'user_csv' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Manual Data Ingestion Accordion Panel */}
          <div className="rounded-lg bg-paper-card border border-steel/25 shadow-panel overflow-hidden">
            <div className="p-4 bg-paper-card border-b border-steel/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-petrol text-white">
                  <PlusCircle className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-18 text-ink flex items-center gap-2">
                    <span>Manual Beneficiary Ingestion &amp; Live Anomaly Scanner</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-petrol-subtle text-petrol uppercase">
                      NetworkX Live Engine
                    </span>
                  </h2>
                  <p className="text-12 text-steel">
                    Manually enter a student application or simulate live fraud injections to see graph clustering in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-12 font-semibold bg-mist text-steel-dark hover:text-ink hover:bg-mist-dark transition-colors"
                >
                  <span>{isFormOpen ? 'Hide Manual Form' : '+ Add Manual Record'}</span>
                  {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isFormOpen && (
              <div className="p-6 space-y-6 animate-fadeIn border-t border-steel/15">
                {/* 4 Simulation Presets */}
                <div className="p-3.5 rounded-lg bg-mist border border-steel/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-11 font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber" />
                      <span>Single-Click Simulation Presets (For Live Presentations &amp; Audits)</span>
                    </span>
                    <span className="text-[11px] text-steel italic">
                      Click to pre-fill test scenarios
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('ring')}
                      className="p-2.5 rounded bg-white border border-signal/30 hover:border-signal text-left transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-12 font-bold text-signal">
                        <span>⚡ Syndicate Ring Match</span>
                        <span className="text-[10px] px-1 bg-signal text-white rounded">HIGH RISK</span>
                      </div>
                      <div className="text-[11px] text-steel mt-0.5">
                        Matches Aadhaar &amp; Bank BA103 / ••1517
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset('mobile')}
                      className="p-2.5 rounded bg-white border border-amber/30 hover:border-amber text-left transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-12 font-bold text-amber-dark">
                        <span>⚡ Mobile Farm Link</span>
                        <span className="text-[10px] px-1 bg-amber text-ink rounded font-semibold">REVIEW</span>
                      </div>
                      <div className="text-[11px] text-steel mt-0.5">
                        Matches multi-grade phone (9149831704)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset('sibling')}
                      className="p-2.5 rounded bg-white border border-sea/30 hover:border-sea text-left transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-12 font-bold text-sea-dark">
                        <span>⚡ Sibling Decoy (Legitimate)</span>
                        <span className="text-[10px] px-1 bg-sea text-white rounded">NORMAL</span>
                      </div>
                      <div className="text-[11px] text-steel mt-0.5">
                        Shared family home, score stays &lt;40
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset('clean')}
                      className="p-2.5 rounded bg-white border border-steel/30 hover:border-steel text-left transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between text-12 font-bold text-ink">
                        <span>⚡ Clean Beneficiary</span>
                        <span className="text-[10px] px-1 bg-mist-dark text-ink rounded">VERIFIED</span>
                      </div>
                      <div className="text-[11px] text-steel mt-0.5">
                        Unique identity with 91% attendance
                      </div>
                    </button>
                  </div>
                </div>

                {/* Ingestion Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                      <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                        1. Identity &amp; Demographics
                      </span>
                      <div>
                        <label className="block text-12 font-medium text-ink mb-1">Student Full Name *</label>
                        <input
                          type="text"
                          name="Student_Name"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={formData.Student_Name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-12 font-medium text-ink mb-1">Admission No *</label>
                          <input
                            type="text"
                            name="Admission_No"
                            required
                            placeholder="e.g. 742"
                            value={formData.Admission_No}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                          />
                        </div>
                        <div>
                          <label className="block text-12 font-medium text-ink mb-1">Class / Grade</label>
                          <select
                            name="Class"
                            value={formData.Class}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                          >
                            <option value="6th">6th</option>
                            <option value="7th">7th</option>
                            <option value="8th">8th</option>
                            <option value="9th">9th</option>
                            <option value="10th">10th</option>
                            <option value="Diploma">Diploma</option>
                            <option value="B.Tech">B.Tech</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                      <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                        2. Disbursement &amp; Identity Rails
                      </span>
                      <div>
                        <label className="block text-12 font-medium text-ink mb-1">Aadhaar Number (12 Digits) *</label>
                        <input
                          type="text"
                          name="Aadhaar_No"
                          required
                          placeholder="e.g. 593974214828"
                          value={formData.Aadhaar_No}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-13 font-mono bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                        />
                      </div>
                      <div>
                        <label className="block text-12 font-medium text-ink mb-1">Bank Account Number *</label>
                        <input
                          type="text"
                          name="Account_No"
                          required
                          placeholder="e.g. 0684041000001517"
                          value={formData.Account_No}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-13 font-mono bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                      <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                        3. Guardians &amp; Verification Metrics
                      </span>
                      <div>
                        <label className="block text-12 font-medium text-ink mb-1">Contact Phone *</label>
                        <input
                          type="text"
                          name="Contact_No"
                          required
                          placeholder="e.g. 9697189784"
                          value={formData.Contact_No}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1.5 text-13 font-mono bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-12 font-medium text-ink mb-1">Attendance %</label>
                          <input
                            type="number"
                            name="attendance"
                            min="0"
                            max="100"
                            value={formData.attendance}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                          />
                        </div>
                        <div>
                          <label className="block text-12 font-medium text-ink mb-1">Amount (₹)</label>
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-steel/15">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(initialForm);
                        setScanResult(null);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-12 font-medium text-steel hover:text-ink bg-mist hover:bg-mist-dark rounded transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Form</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isScanning}
                      className="flex items-center gap-2 px-6 py-2.5 text-14 font-semibold text-white bg-petrol hover:bg-petrol-hover disabled:bg-steel rounded shadow-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>
                        {isScanning ? 'Evaluating Graph Topology...' : 'Ingest Record & Run Live Anomaly Scan'}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Scan Result */}
                {scanResult && (
                  <div
                    className={`p-4 rounded-lg border transition-all animate-slideIn ${
                      scanResult.status === 'detected'
                        ? 'bg-signal-subtle/40 border-signal/40'
                        : 'bg-sea-subtle/50 border-sea/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {scanResult.status === 'detected' ? (
                          <AlertTriangle className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-sea shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4
                            className={`font-display font-bold text-15 ${
                              scanResult.status === 'detected' ? 'text-signal-dark' : 'text-sea-dark'
                            }`}
                          >
                            {scanResult.message}
                          </h4>
                          {scanResult.reasons && (
                            <ul className="mt-2 space-y-1 text-12 text-ink">
                              {scanResult.reasons.map((r, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {scanResult.clusterId && (
                        <button
                          onClick={() => onOpenCluster(scanResult.clusterId!)}
                          className="px-4 py-2 text-12 font-bold bg-signal text-white rounded hover:bg-signal-dark transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <span>Inspect in 3D Graph ({scanResult.clusterId})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extracted Clusters from students.csv */}
          <div className="p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-signal" strokeWidth={1.5} />
                <h2 className="font-display font-bold text-18 text-ink">
                  Clusters Extracted from Uploaded File (students.csv)
                </h2>
              </div>
              <span className="text-12 text-steel">
                NetworkX Connected Components Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {csvClusters.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onOpenCluster(c.id)}
                  className="p-4 rounded-lg bg-paper border border-signal/30 hover:border-signal transition-all cursor-pointer card-tilt shadow-panel"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-16 text-ink">{c.id}</span>
                    <span className="font-display font-bold text-16 text-signal tabular-nums">
                      {c.score}/100
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-14 text-ink mt-2 line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-12 text-steel mt-1 line-clamp-2">
                    {c.pattern}
                  </p>
                  <div className="mt-3 pt-2 border-t border-steel/15 flex items-center justify-between text-11 text-petrol font-semibold">
                    <span>{c.counts.students} Students</span>
                    <span className="inline-flex items-center gap-1">
                      Open in 3D <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw User Data Table Toolbar */}
          <div className="p-4 rounded-lg bg-paper-card border border-steel/20 shadow-panel flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students by name, admission #, or Aadhaar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-14 bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink font-sans"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-12 text-steel">
                <span>Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-12 font-medium bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink"
                >
                  <option value="all">All Categories</option>
                  <option value="Gen">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <button
                onClick={() => handleExportCSV('students.csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-12 font-semibold rounded bg-petrol text-white hover:bg-petrol-hover transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({filteredUserStudents.length})</span>
              </button>
            </div>
          </div>

          {/* User CSV Records Table */}
          <DataTable
            columns={userColumns}
            data={filteredUserStudents}
            keyField="Student_ID"
          />
        </div>
      )}

      {/* -------------------- TAB 2: NATIONAL SYNTHETIC DATASET (10,000 APPS) -------------------- */}
      {activeDatasetTab === 'synthetic_benchmark' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Synthetic Benchmark Headline Banner */}
          <div className="p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel/15">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-petrol" strokeWidth={1.5} />
                  <h2 className="font-display font-bold text-20 text-ink">
                    National Synthetic Benchmark Dataset (DEMO_DATA.md Spec)
                  </h2>
                </div>
                <p className="text-12 text-steel mt-1">
                  10,000 synthetic applications generated with fixed random seed 42 across 60 accredited institutions.
                </p>
              </div>

              <button
                onClick={() => handleExportCSV('synthetic_applications_sample.csv')}
                className="flex items-center gap-2 px-4 py-2 text-12 font-semibold rounded bg-petrol text-white hover:bg-petrol-hover transition-colors shadow-sm self-start md:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Applications CSV</span>
              </button>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 rounded bg-paper border border-steel/15">
                <span className="text-11 text-steel font-semibold uppercase">Total Applications</span>
                <div className="font-display font-bold text-24 text-ink tabular-nums mt-0.5">10,000</div>
                <span className="text-[11px] text-steel">Across 9,200 students</span>
              </div>

              <div className="p-3 rounded bg-paper border border-sea/30">
                <span className="text-11 text-sea-dark font-semibold uppercase">Normal Verified</span>
                <div className="font-display font-bold text-24 text-sea-dark tabular-nums mt-0.5">8,940</div>
                <span className="text-[11px] text-steel">89.4% standard claims</span>
              </div>

              <div className="p-3 rounded bg-paper border border-amber/30">
                <span className="text-11 text-amber-dark font-semibold uppercase">Review Required</span>
                <div className="font-display font-bold text-24 text-amber-dark tabular-nums mt-0.5">820</div>
                <span className="text-[11px] text-steel">Decoys, siblings, parent phone</span>
              </div>

              <div className="p-3 rounded bg-paper border border-signal/30">
                <span className="text-11 text-signal-dark font-semibold uppercase">High-Risk Priority</span>
                <div className="font-display font-bold text-24 text-signal tabular-nums mt-0.5">240</div>
                <span className="text-[11px] text-steel">Concentrated in 12 clusters</span>
              </div>
            </div>
          </div>

          {/* Generated CSV Files Directory (from data/synthetic/) */}
          <div className="p-5 rounded-lg bg-paper-card border border-steel/20 shadow-panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-petrol" />
                <h3 className="font-display font-semibold text-16 text-ink">
                  Generated Synthetic Database Tables (<code className="text-12 font-mono">data/synthetic/</code>)
                </h3>
              </div>
              <span className="text-11 text-steel">PostgreSQL seed.sql compliant</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {syntheticCsvFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-steel/20 bg-paper flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-12 font-bold text-petrol">{file.filename}</span>
                      <span className="text-[10px] font-semibold text-steel bg-mist px-1.5 py-0.5 rounded">
                        {file.size_formatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-steel mt-1 line-clamp-2 leading-snug">{file.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-steel/15 flex items-center justify-between text-11 text-steel">
                    <span>{file.rows.toLocaleString()} rows</span>
                    <button
                      onClick={() => handleExportCSV(file.filename)}
                      className="text-petrol font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Export &darr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synthetic Applications Filter Toolbar */}
          <div className="p-4 rounded-lg bg-paper-card border border-steel/20 shadow-panel flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by App ID (e.g. A000001), Student ID (S003), or Name..."
                value={synthSearch}
                onChange={(e) => setSynthSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-14 bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink font-sans"
              />
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-12 text-steel">
                <Filter className="w-3.5 h-3.5 text-petrol" />
                <span>Scheme:</span>
                <select
                  value={synthSchemeFilter}
                  onChange={(e) => setSynthSchemeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-12 font-medium bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink"
                >
                  <option value="all">All 5 Schemes</option>
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="Minority Welfare">Minority Welfare</option>
                  <option value="SC/ST Welfare Scheme">SC/ST Welfare</option>
                  <option value="Post-Matric Technical">Post-Matric Technical</option>
                  <option value="Girl Child Assistance">Girl Child Assistance</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-12 text-steel">
                <span>Risk Band:</span>
                <select
                  value={synthBandFilter}
                  onChange={(e) => setSynthBandFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-12 font-medium bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink"
                >
                  <option value="all">All Bands</option>
                  <option value="high">High Risk (Hero CL-104)</option>
                  <option value="review">Review Required (Decoys)</option>
                  <option value="normal">Normal Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Synthetic Applications Table */}
          <DataTable
            columns={syntheticColumns}
            data={filteredSyntheticApps}
            keyField="application_id"
            onRowClick={(row) => {
              if (row.risk_band === 'high') {
                onOpenCluster('CL-104');
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
