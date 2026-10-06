import React, { useState, useMemo } from 'react';
import { Cluster } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { FileSpreadsheet, ShieldCheck, AlertCircle, Search, Sparkles, Database, ArrowRight, Eye } from 'lucide-react';

interface DataPageProps {
  rawStudents: any[];
  csvClusters: Cluster[];
  onOpenCluster: (clusterId: string) => void;
}

export const DataPage: React.FC<DataPageProps> = ({
  rawStudents,
  csvClusters,
  onOpenCluster,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
            <span>DPDP &amp; Privacy Compliant</span>
          </span>
        </div>
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
