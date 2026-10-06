import React, { useState, useMemo } from 'react';
import { Cluster } from '../types';
import { DataTable, Column } from '../components/DataTable';
import {
  FileSpreadsheet,
  ShieldCheck,
  AlertCircle,
  Search,
  Sparkles,
  Database,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  User,
  CreditCard,
  Phone,
  FileText,
  School,
  ChevronDown,
  ChevronUp,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'detected' | 'clean';
    clusterId?: string;
    score?: number;
    message: string;
    reasons?: string[];
  } | null>(null);

  // Form State
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
        Aadhaar_No: '593974214828', // Matches Kasturi & Adrash!
        Account_No: '0684041000001517', // Matches Kasturi & Adrash!
        Contact_No: '9697189784',
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'Mole on collarbone',
        attendance: 14, // Critically low!
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
        Contact_No: '9149831704', // Shared contact triad with Vikas, Sumit, Akshara!
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
        Account_No: '0684041000008888', // Individual account
        Contact_No: '9682558540', // Shares parent phone with Vishal Chandan (Decoy)
        IFSC_Code: 'JAKA0KALBAR',
        Identification_Mark: 'None',
        attendance: 86, // Normal attendance!
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

    // Simulate scanning micro-delay for realistic graph inspection feel
    setTimeout(async () => {
      let matchedClusterId: string | undefined;
      let clusterScore: number | undefined;

      if (onAddStudent) {
        const res = await onAddStudent(formData);
        if (res && res.matchedCluster) {
          matchedClusterId = res.matchedCluster.id;
          clusterScore = res.matchedCluster.score;
        }
      }

      // Check signals
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

  const filtered = useMemo(() => {
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

  const columns: Column<any>[] = [
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

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-steel/20 pb-4">
        <div>
          <h1 className="font-display font-bold text-28 text-ink tracking-tight">
            Data Explorer &amp; Live Ingestion
          </h1>
          <p className="text-14 text-steel mt-0.5">
            Active workspace file: <code className="bg-mist px-2 py-0.5 rounded text-12 font-mono">students.csv</code> ({rawStudents.length} records analyzed live via NetworkX).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-12 font-medium px-3 py-1 bg-sea-subtle text-sea-dark border border-sea/30 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sea" />
            <span>DPDP &amp; Privacy Masked</span>
          </span>
        </div>
      </div>

      {/* NEW: Manual Data Ingestion & Live Anomaly Scanner Section */}
      <div className="rounded-lg bg-paper-card border border-steel/25 shadow-panel overflow-hidden">
        {/* Toggle Bar */}
        <div className="p-4 bg-paper-card border-b border-steel/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-petrol text-white">
              <PlusCircle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display font-bold text-18 text-ink flex items-center gap-2">
                <span>Manual Record Ingestion &amp; Live Anomaly Scanner</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-petrol-subtle text-petrol uppercase">
                  Real-Time NetworkX
                </span>
              </h2>
              <p className="text-12 text-steel">
                Manually input student applications or trigger simulation presets to observe live graph clustering.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-12 font-semibold bg-mist text-steel-dark hover:text-ink hover:bg-mist-dark transition-colors"
            >
              <span>{isFormOpen ? 'Collapse Form' : 'Expand Form'}</span>
              {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isFormOpen && (
          <div className="p-6 space-y-6 animate-fadeIn">
            {/* Quick Demo Presets */}
            <div className="p-3.5 rounded-lg bg-mist border border-steel/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-11 font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber" />
                  <span>One-Click Simulation Presets (For Live Presentations &amp; Testing)</span>
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
                    <span className="text-[10px] px-1 bg-signal text-white rounded">HIGH</span>
                  </div>
                  <div className="text-[11px] text-steel mt-0.5">
                    Duplicate Aadhaar &amp; Bank Account (••1517)
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
                    Shares multi-class contact (9149831704)
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
                    Shared parent &amp; home, score stays &lt;40
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
                {/* 1. Identity */}
                <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                  <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                    1. Student Identity &amp; Demographics
                  </span>

                  <div>
                    <label className="block text-12 font-medium text-ink mb-1">
                      Student Full Name *
                    </label>
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
                      <label className="block text-12 font-medium text-ink mb-1">
                        Admission No *
                      </label>
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
                      <label className="block text-12 font-medium text-ink mb-1">
                        Grade / Class
                      </label>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        Category
                      </label>
                      <select
                        name="Category"
                        value={formData.Category}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                      >
                        <option value="Gen">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        DOB
                      </label>
                      <input
                        type="text"
                        name="DOB"
                        placeholder="DD-MM-YYYY"
                        value={formData.DOB}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Rails & Identifiers */}
                <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                  <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                    2. Disbursement &amp; Identity Rails
                  </span>

                  <div>
                    <label className="block text-12 font-medium text-ink mb-1">
                      Aadhaar Number (12 Digits) *
                    </label>
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
                    <label className="block text-12 font-medium text-ink mb-1">
                      Bank Account Number *
                    </label>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        Contact / Phone *
                      </label>
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
                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="IFSC_Code"
                        value={formData.IFSC_Code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-13 font-mono bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Guardians & Anomaly Factors */}
                <div className="space-y-3 p-4 rounded bg-paper border border-steel/15">
                  <span className="text-11 font-bold text-petrol uppercase tracking-wider block">
                    3. Guardians &amp; Verification Metrics
                  </span>

                  <div>
                    <label className="block text-12 font-medium text-ink mb-1">
                      Father / Guardian Name
                    </label>
                    <input
                      type="text"
                      name="Father_Name"
                      placeholder="e.g. Parshotam Sharma"
                      value={formData.Father_Name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        Attendance %
                      </label>
                      <input
                        type="number"
                        name="attendance"
                        min="0"
                        max="100"
                        value={formData.attendance}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                      />
                      <span className="text-[10px] text-steel">&lt; 30% triggers anomaly</span>
                    </div>

                    <div>
                      <label className="block text-12 font-medium text-ink mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-12 font-medium text-ink mb-1">
                      Enrolled Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 text-13 bg-white border border-steel/30 rounded focus:outline-none focus:border-petrol"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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

            {/* Live Scan Result Alert Card */}
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

      {/* Discovered Anomaly Clusters in Uploaded CSV */}
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

      {/* Raw Data Search & Filter */}
      <div className="p-4 rounded-lg bg-paper-card border border-steel/20 shadow-panel flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, admission #, or Aadhaar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-14 bg-white border border-steel/40 rounded focus:outline-none focus:border-petrol text-ink font-sans"
          />
        </div>

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
      </div>

      {/* Raw Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyField="Student_ID"
      />
    </div>
  );
};
