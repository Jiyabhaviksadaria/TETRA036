import { Alert } from '@/types/alert';
import { rakshakApi, IncidentRecord } from './rakshakApi';

export const mockAlerts: Alert[] = [
  {
    id: 'alt-101',
    title: 'Wild Boar Pack Approaching Crops',
    description: 'A herd of 4 wild boars detected moving rapidly toward Sector 4 sugarcane field.',
    severity: 'critical',
    status: 'active',
    timestamp: 'Just now (13:48:12)',
    cameraId: 'cam-01',
    location: 'Zone B Orchard Perimeter',
    confidenceScore: 94,
    threatType: 'Wild Boar',
    snapshotUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'alt-102',
    title: 'Blue Bull (Nilgai) Near Fence Line',
    description: 'Single adult Nilgai spotted near North Irrigation Ditch.',
    severity: 'high',
    status: 'active',
    timestamp: '14 mins ago',
    cameraId: 'cam-03',
    location: 'South Pasture Aerial',
    confidenceScore: 88,
    threatType: 'Nilgai',
    snapshotUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'alt-103',
    title: 'Stray Cattle Intrusion Prevented',
    description: 'Acoustic siren activated automatically. 2 cattle turned back.',
    severity: 'medium',
    status: 'resolved',
    timestamp: '42 mins ago',
    cameraId: 'cam-02',
    location: 'Zone A Corn Field East',
    confidenceScore: 96,
    threatType: 'Stray Cattle',
    snapshotUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'alt-104',
    title: 'Porcupine Burrowing Movement',
    description: 'Small animal detected near subterranean root vegetable nursery.',
    severity: 'low',
    status: 'resolved',
    timestamp: '2 hours ago',
    cameraId: 'cam-04',
    location: 'Zone C Wheat Field West',
    confidenceScore: 91,
    threatType: 'Porcupine',
  },
];

function threatToSeverity(level: string): Alert['severity'] {
  if (level === 'HIGH') return 'critical';
  if (level === 'MEDIUM') return 'high';
  if (level === 'LOW') return 'medium';
  return 'low';
}

function incidentToAlert(inc: IncidentRecord): Alert {
  return {
    id: inc.id,
    title: `${inc.animal} Detected — ${inc.threat_level}`,
    description: inc.reason.join('. ') || `${inc.animal} detected near crop area.`,
    severity: threatToSeverity(inc.threat_level),
    status: inc.farmer_action ? 'resolved' : 'active',
    timestamp: new Date(inc.timestamp).toLocaleTimeString(),
    cameraId: 'cam-01',
    location: 'Farm Perimeter',
    confidenceScore: Math.round(inc.confidence * 100),
    threatType: inc.animal,
  };
}

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      const incidents = await rakshakApi.getTimeline();
      if (incidents.length > 0) return incidents.map(incidentToAlert);
    } catch {
      // backend not running — fall back to mock data
    }
    return Promise.resolve(mockAlerts);
  },
};
