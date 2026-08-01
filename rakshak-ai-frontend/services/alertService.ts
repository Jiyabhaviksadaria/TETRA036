import { Alert } from '@/types/alert';

export const mockAlerts: Alert[] = [
  {
    id: 'alt-001',
    title: 'Unidentified Intruder Detected',
    description: 'Perimeter thermal sensor detected movement near Gate 4.',
    severity: 'critical',
    status: 'active',
    timestamp: new Date().toISOString(),
    cameraId: 'cam-01',
    location: 'Sector 4 - Perimeter Wall',
    confidenceScore: 0.96,
    threatType: 'Perimeter Intrusion',
  },
  {
    id: 'alt-002',
    title: 'Unattended Object Warning',
    description: 'Baggage detected unattended for over 15 minutes in Main Lobby.',
    severity: 'high',
    status: 'investigating',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    cameraId: 'cam-03',
    location: 'Main Terminal Lobby',
    confidenceScore: 0.88,
    threatType: 'Suspicious Object',
  },
  {
    id: 'alt-003',
    title: 'Camera Tampering Alarm',
    description: 'Video feed obscured or lens covered on North Substation camera.',
    severity: 'medium',
    status: 'resolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    cameraId: 'cam-07',
    location: 'North Power Substation',
    confidenceScore: 0.91,
    threatType: 'Hardware Anomaly',
  },
];

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    return Promise.resolve(mockAlerts);
  },
  async getAlertById(id: string): Promise<Alert | undefined> {
    return Promise.resolve(mockAlerts.find((a) => a.id === id));
  },
};
