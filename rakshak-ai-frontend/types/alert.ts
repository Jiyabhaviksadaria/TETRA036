export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'investigating' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  timestamp: string;
  cameraId: string;
  location: string;
  confidenceScore: number;
  threatType: string;
  snapshotUrl?: string;
}
