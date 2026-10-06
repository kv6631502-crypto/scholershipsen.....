import { SummaryData, Cluster, Institution, ActionPayload } from '../types';

import summaryFixture from '../fixtures/summary.json';
import clustersFixture from '../fixtures/clusters.json';
import institutionsFixture from '../fixtures/institutions.json';
import csvClustersFixture from '../fixtures/csv_clusters.json';
import studentsRawFixture from '../fixtures/students_raw.json';

const API_BASE = 'http://localhost:8000/api';

// In-memory cluster cache to keep local state updates persistent when offline
let localClusters: Cluster[] = JSON.parse(JSON.stringify(clustersFixture));
let localCsvClusters: Cluster[] = JSON.parse(JSON.stringify(csvClustersFixture));

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
    return studentsRawFixture;
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
