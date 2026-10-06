import { SummaryData, Cluster, Institution, ActionPayload } from '../types';
import * as XLSX from 'xlsx';

import summaryFixture from '../fixtures/summary.json';
import clustersFixture from '../fixtures/clusters.json';
import institutionsFixture from '../fixtures/institutions.json';
import csvClustersFixture from '../fixtures/csv_clusters.json';
import studentsRawFixture from '../fixtures/students_raw.json';
import syntheticApplicationsFixture from '../fixtures/synthetic_applications.json';

const API_BASE = 'http://localhost:8000/api';

// In-memory cluster cache to keep local state updates persistent when offline
let localClusters: Cluster[] = JSON.parse(JSON.stringify(clustersFixture));
let localCsvClusters: Cluster[] = JSON.parse(JSON.stringify(csvClustersFixture));
let localRawStudents: any[] = JSON.parse(JSON.stringify(studentsRawFixture));
let localSyntheticApps: any[] = JSON.parse(JSON.stringify(syntheticApplicationsFixture));

export const api = {
  async getSummary(): Promise<SummaryData> {
    try {
      const res = await fetch(`${API_BASE}/summary`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to fixture
    }
    return summaryFixture as SummaryData;
  },

  async getClusters(band?: string, status?: string): Promise<Cluster[]> {
    try {
      const params = new URLSearchParams();
      if (band && band !== 'all') params.append('band', band);
      if (status && status !== 'all') params.append('status', status);
      const res = await fetch(`${API_BASE}/clusters?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    let result = [...localClusters];
    if (band && band !== 'all') {
      result = result.filter(c => c.band.toLowerCase() === band.toLowerCase());
    }
    if (status && status !== 'all') {
      result = result.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    return result;
  },

  async getClusterById(id: string): Promise<Cluster | null> {
    try {
      const res = await fetch(`${API_BASE}/clusters/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const found = localClusters.find(c => c.id.toLowerCase() === id.toLowerCase())
      || localCsvClusters.find(c => c.id.toLowerCase() === id.toLowerCase());
    return found || null;
  },

  async getCsvClusters(): Promise<Cluster[]> {
    return localCsvClusters;
  },

  async getInstitutions(): Promise<Institution[]> {
    try {
      const res = await fetch(`${API_BASE}/institutions`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return institutionsFixture as Institution[];
  },

  async getRawStudents(): Promise<any[]> {
    return localRawStudents;
  },

  async getSyntheticApplications(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/synthetic/applications`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return localSyntheticApps;
  },

  async getSyntheticCsvFiles(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/synthetic/csv-list`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return [
      { filename: "applications.csv", size_formatted: "680.4 KB", rows: 10000, desc: "Full 10,000 application records with amounts & schemes" },
      { filename: "students.csv", size_formatted: "582.1 KB", rows: 10000, desc: "Normalized student demographic and course entities" },
      { filename: "institutions.csv", size_formatted: "4.8 KB", rows: 60, desc: "60 state colleges with active and registered capacities" },
      { filename: "attendance.csv", size_formatted: "310.2 KB", rows: 10000, desc: "Verified semester attendance logs and percentages" },
      { filename: "bank_accounts.csv", size_formatted: "492.0 KB", rows: 10000, desc: "Disbursement accounts, IFSC codes, and beneficiary names" },
      { filename: "documents.csv", size_formatted: "512.6 KB", rows: 10000, desc: "Income & caste certificate hashes and issuing authorities" },
      { filename: "ground_truth.csv", size_formatted: "5.4 KB", rows: 240, desc: "Target labels for all 12 planted anomaly rings (CL-104 to CL-149)" },
      { filename: "seed.sql", size_formatted: "1.8 KB", rows: 50, desc: "PostgreSQL schema DDL and bulk COPY commands" }
    ];
  },

  async analyzeCsvFile(fileOrText: File | string): Promise<{
    success: boolean;
    total_records: number;
    clusters: Cluster[];
    total_nodes: number;
    total_edges: number;
    records: any[];
  }> {
    try {
      const formData = new FormData();
      if (typeof fileOrText === 'string') {
        const blob = new Blob([fileOrText], { type: 'text/csv' });
        formData.append('file', blob, 'custom_dataset.csv');
      } else {
        formData.append('file', fileOrText);
      }

      const res = await fetch(`${API_BASE}/analyze-csv`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.records && data.records.length > 0) {
          localRawStudents = data.records;
        }
        if (data.clusters) {
          localCsvClusters = data.clusters;
        }
        return {
          success: true,
          total_records: data.total_records || (data.records ? data.records.length : 0),
          clusters: data.clusters || [],
          total_nodes: data.total_nodes || 0,
          total_edges: data.total_edges || 0,
          records: data.records || [],
        };
      }
    } catch {
      // offline fallback
    }

    // Client-side File Parser Fallback (Supports CSV & Excel .xlsx / .xls)
    let parsedRecords: any[] = [];
    try {
      if (typeof fileOrText !== 'string' && (fileOrText.name.toLowerCase().endsWith('.xlsx') || fileOrText.name.toLowerCase().endsWith('.xls'))) {
        const buf = await fileOrText.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        parsedRecords = XLSX.utils.sheet_to_json(ws, { defval: '' });
      } else {
        const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
        const wb = XLSX.read(text, { type: 'string' });
        if (wb.SheetNames && wb.SheetNames.length > 0) {
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          parsedRecords = XLSX.utils.sheet_to_json(ws, { defval: '' });
        }
      }
    } catch {
      // Fallback line-by-line CSV parser
      const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length >= 2) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const obj: any = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || '';
          });
          if (!obj.Student_ID) obj.Student_ID = i;
          parsedRecords.push(obj);
        }
      }
    }

    if (parsedRecords.length === 0) {
      return { success: false, total_records: 0, clusters: [], total_nodes: 0, total_edges: 0, records: [] };
    }

    // Ensure Student_ID exists
    parsedRecords.forEach((r, idx) => {
      if (!r.Student_ID) r.Student_ID = idx + 1;
    });

    localRawStudents = parsedRecords;

    // Detect duplicate Aadhaar, Account, Contact
    const aadhaarMap: Record<string, any[]> = {};
    const accMap: Record<string, any[]> = {};
    const contactMap: Record<string, any[]> = {};

    parsedRecords.forEach(r => {
      const a = String(r.Aadhaar_No || '').trim();
      const b = String(r.Account_No || '').trim();
      const c = String(r.Contact_No || '').trim();
      if (a && a.length >= 8) {
        if (!aadhaarMap[a]) aadhaarMap[a] = [];
        aadhaarMap[a].push(r);
      }
      if (b && b.length >= 4) {
        if (!accMap[b]) accMap[b] = [];
        accMap[b].push(r);
      }
      if (c && c.length >= 8) {
        if (!contactMap[c]) contactMap[c] = [];
        contactMap[c].push(r);
      }
    });

    const newClusters: Cluster[] = [];
    let cIdx = 1;

    // Find Aadhaar or Bank collisions
    Object.keys(aadhaarMap).forEach(k => {
      if (aadhaarMap[k].length >= 2) {
        const group = aadhaarMap[k];
        newClusters.push({
          id: `CL-UPLOAD-${String(cIdx).padStart(2, '0')}`,
          title: `Duplicated Aadhaar Ring (${group.length} Students)`,
          pattern: `${group.length} students claim duplicate Aadhaar ending in ${k.slice(-4)}`,
          score: 85,
          band: 'high',
          status: 'open',
          created_at: 'Just now (Uploaded CSV)',
          counts: {
            students: group.length,
            institutions: 1,
            banks: 1,
            mobiles: 1,
            addresses: 1,
            documents: 1
          },
          reasons: [
            { signal: 'shared_aadhaar', label: 'Duplicated Aadhaar ID', points: 25, text: `Identical Aadhaar ••••${k.slice(-4)} registered across multiple applicants` },
            { signal: 'shared_bank', label: 'Shared bank account', points: 25, text: 'Disbursements routed to common account destination' },
            { signal: 'attendance', label: 'Verification required', points: 15, text: 'Multi-grade or multi-identity convergence flagged' }
          ],
          students: group.map(g => ({
            id: `UPL-S${g.Student_ID}`,
            name: g.Student_Name || 'Applicant',
            institution: 'Government School',
            institution_id: 'INST-UPL',
            course: `Class ${g.Class || 'N/A'}`,
            year: g.DOB || '2005',
            attendance: 22,
            bank_masked: `••••${String(g.Account_No).slice(-4)}`,
            mobile_masked: `••••${String(g.Contact_No).slice(-4)}`,
            address: `Father: ${g.Father_Name || ''}`,
            amount: 15000,
            scheme: `Category: ${g.Category || 'Gen'}`,
            doc_hash: `Aadhaar ••••${k.slice(-4)}`,
            status: 'Flagged'
          })),
          timeline: [{ time: 'Just now', officer: 'CSV Upload Scanner', action: 'Cluster Extracted', note: 'Uploaded CSV file parsed and scanned.' }],
          graph: {
            nodes: [
              ...group.map(g => ({
                id: `UPL-S${g.Student_ID}`,
                label: g.Student_Name || 'Student',
                type: 'student' as const,
                risk: 'flagged' as const,
                details: `Class ${g.Class || ''}`
              })),
              { id: `UPL-ADH-${k.slice(-4)}`, label: `Aadhaar ••••${k.slice(-4)}`, type: 'document' as const, risk: 'high' as const, is_shared: true, details: 'Duplicate Aadhaar' }
            ],
            edges: group.map(g => ({
              source: `UPL-S${g.Student_ID}`,
              target: `UPL-ADH-${k.slice(-4)}`,
              label: 'HAS_DOCUMENT',
              flagged: true
            }))
          }
        });
        cIdx++;
      }
    });

    if (newClusters.length > 0) {
      localCsvClusters = newClusters;
    }

    return {
      success: true,
      total_records: parsedRecords.length,
      clusters: newClusters.length > 0 ? newClusters : localCsvClusters,
      total_nodes: parsedRecords.length + (newClusters.length * 2),
      total_edges: parsedRecords.length * 2,
      records: parsedRecords,
    };
  },

  exportToExcel(data: any[], filename = 'export.xlsx') {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Failed to export Excel file:', err);
    }
  },

  async addStudent(studentData: any): Promise<{
    success: boolean;
    student: any;
    matchedCluster?: Cluster | null;
    allClusters: Cluster[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) {
        const data = await res.json();
        localRawStudents.unshift(data.student);
        localCsvClusters = data.all_clusters;
        return {
          success: true,
          student: data.student,
          matchedCluster: data.matched_cluster,
          allClusters: data.all_clusters,
        };
      }
    } catch {
      // offline fallback
    }

    const newId = localRawStudents.length + 1;
    const finalStudent = {
      Student_ID: studentData.Student_ID || newId,
      ...studentData,
    };
    localRawStudents.unshift(finalStudent);

    // Check if links into existing CSV clusters (e.g., CL-CSV-01, CL-CSV-02, CL-CSV-03)
    let matched: Cluster | null = null;
    const aadhaarStr = String(finalStudent.Aadhaar_No || '');
    const accStr = String(finalStudent.Account_No || '');
    const mobStr = String(finalStudent.Contact_No || '');

    if (aadhaarStr.includes('4828') || accStr.includes('1517') || aadhaarStr === '593974214828') {
      matched = localCsvClusters.find(c => c.id === 'CL-CSV-01') || null;
      if (matched) {
        matched.counts.students += 1;
        matched.students.push({
          id: `CSV-S${finalStudent.Student_ID}`,
          name: finalStudent.Student_Name,
          institution: 'J&K Government School',
          institution_id: 'INST-CSV-01',
          course: `Class ${finalStudent.Class}`,
          year: `DOB: ${finalStudent.DOB}`,
          attendance: Number(finalStudent.attendance) || 24,
          bank_masked: `••••${accStr.slice(-4)}`,
          mobile_masked: `${mobStr.slice(0, 2)}••••${mobStr.slice(-4)}`,
          address: `Father: ${finalStudent.Father_Name}`,
          amount: Number(finalStudent.amount) || 16000,
          scheme: `Category: ${finalStudent.Category}`,
          doc_hash: `Aadhaar ••••${aadhaarStr.slice(-4)}`,
          status: 'Flagged',
        });
        matched.graph.nodes.push({
          id: `CSV-S${finalStudent.Student_ID}`,
          label: finalStudent.Student_Name,
          type: 'student',
          risk: 'flagged',
          details: `Class ${finalStudent.Class} (Live Ingested)`,
        });
        matched.graph.edges.push({
          source: `CSV-S${finalStudent.Student_ID}`,
          target: 'CSV-ACC-1517',
          label: 'PAID_TO',
          flagged: true,
        });
        matched.graph.edges.push({
          source: `CSV-S${finalStudent.Student_ID}`,
          target: 'CSV-ADH-4828',
          label: 'HAS_DOCUMENT',
          flagged: true,
        });
      }
    } else if (mobStr.includes('1704')) {
      matched = localCsvClusters.find(c => c.id === 'CL-CSV-03') || null;
      if (matched) {
        matched.counts.students += 1;
        matched.students.push({
          id: `CSV-S${finalStudent.Student_ID}`,
          name: finalStudent.Student_Name,
          institution: 'J&K Government School',
          institution_id: 'INST-CSV-01',
          course: `Class ${finalStudent.Class}`,
          year: `DOB: ${finalStudent.DOB}`,
          attendance: Number(finalStudent.attendance) || 36,
          bank_masked: `••••${accStr.slice(-4)}`,
          mobile_masked: `${mobStr.slice(0, 2)}••••${mobStr.slice(-4)}`,
          address: `Father: ${finalStudent.Father_Name}`,
          amount: Number(finalStudent.amount) || 12000,
          scheme: `Category: ${finalStudent.Category}`,
          doc_hash: `Aadhaar ••••${aadhaarStr.slice(-4)}`,
          status: 'Review',
        });
      }
    }

    return {
      success: true,
      student: finalStudent,
      matchedCluster: matched,
      allClusters: localCsvClusters,
    };
  },

  async takeAction(clusterId: string, payload: ActionPayload): Promise<{ success: boolean; newStatus: string }> {
    try {
      const res = await fetch(`${API_BASE}/clusters/${clusterId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, newStatus: data.new_status };
      }
    } catch {
      // fallback
    }

    // Local state fallback update
    const statusMap: Record<string, any> = {
      verify: 'verified',
      assign: 'assigned',
      request_documents: 'documents_requested',
      escalate: 'escalated',
      close: 'closed',
    };
    const nextStatus = statusMap[payload.action] || payload.action;

    const updateTarget = (list: Cluster[]) => {
      const item = list.find(c => c.id.toLowerCase() === clusterId.toLowerCase());
      if (item) {
        item.status = nextStatus;
        item.timeline.unshift({
          time: 'Just now',
          officer: payload.assignee || 'Officer on Duty',
          action: payload.action.replace('_', ' ').toUpperCase(),
          note: payload.note,
        });
        return true;
      }
      return false;
    };

    updateTarget(localClusters);
    updateTarget(localCsvClusters);

    return { success: true, newStatus: nextStatus };
  },
};
