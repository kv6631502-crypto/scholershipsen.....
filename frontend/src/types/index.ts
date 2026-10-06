export type RiskBand = 'high' | 'review' | 'normal';
export type CaseStatus = 'open' | 'assigned' | 'documents_requested' | 'escalated' | 'closed';

export interface SignalReason {
  signal: string;
  label: string;
  points: number;
  text: string;
}

export interface ClusterStudent {
  id: string;
  name: string;
  institution: string;
  institution_id: string;
  course: string;
  year: string;
  attendance: number;
  bank_masked: string;
  mobile_masked: string;
  address: string;
  amount: number;
  scheme: string;
  doc_hash: string;
  status: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'student' | 'bank' | 'mobile' | 'institution' | 'address' | 'document';
  risk: 'high' | 'amber' | 'flagged' | 'normal';
  is_shared?: boolean;
  details?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  flagged: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineItem {
  time: string;
  officer: string;
  action: string;
  note: string;
}

export interface Cluster {
  id: string;
  title: string;
  pattern: string;
  score: number;
  band: RiskBand;
  status: CaseStatus;
  is_hero?: boolean;
  created_at: string;
  counts: {
    students: number;
    institutions: number;
    banks: number;
    mobiles: number;
    addresses: number;
    documents: number;
  };
  reasons: SignalReason[];
  students: ClusterStudent[];
  timeline: TimelineItem[];
  graph: GraphData;
}

export interface Institution {
  id: string;
  name: string;
  state: string;
  district: string;
  type: string;
  registered: number;
  active: number;
  applications: number;
  surge_ratio: number;
}

export interface SummaryData {
  applications_analyzed: number;
  students_count: number;
  institutions_count: number;
  bands: {
    normal: number;
    review: number;
    high: number;
  };
  clusters_count: {
    total: number;
    high_risk: number;
    review: number;
    normal: number;
  };
  institutions_flagged: number;
  recent_activities: Array<{
    time: string;
    officer: string;
    action: string;
    cluster_id: string;
    note: string;
  }>;
}

export type ActionType = 'verify' | 'assign' | 'request_documents' | 'escalate' | 'close';

export interface ActionPayload {
  action: ActionType;
  note: string;
  assignee?: string;
}
