/**
 * Rakshak AI Backend API service.
 * All calls go to http://localhost:8000 (or NEXT_PUBLIC_API_URL).
 */
import { parseContentDispositionFilename } from '@/utils/download';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SystemState {
  farm_status: string;
  system: string;
  camera: string;
  motion: string;
  ai: string;
  alert: string;
}

export interface FullStatus {
  threat_level: string;
  recommendation: string;
  reason: string[];
  animal: string;
  confidence: number;
  timestamp: string;
  system_state: SystemState;
  active_scenario: string | null;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  animal: string;
  confidence: number;
  threat_level: string;
  recommendation: string;
  reason: string[];
  farmer_action: string | null;
  decision_input: Record<string, unknown>;
}

export interface SimulationResult {
  scenario: string;
  system_state: SystemState;
  threat: {
    threat_level: string;
    recommendation: string;
    reason: string[];
    animal: string;
    confidence: number;
    timestamp: string;
  };
  incident_id: string;
  timestamp: string;
}

export interface VisionStatus {
  animal: string;
  confidence: number;
  tracking_id: number | null;
  direction: string;
  inside_boundary: boolean | null;
  position: number[] | null;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export const rakshakApi = {
  /** GET /status — threat + Mission Control system state */
  getStatus: () => get<FullStatus>('/status'),

  /** GET /timeline — incident history, newest first */
  getTimeline: () => get<IncidentRecord[]>('/timeline'),

  /** GET /vision/status — latest vision detection frame */
  getVisionStatus: () => get<VisionStatus>('/vision/status'),

  /** POST /simulate — run full end-to-end scenario simulation */
  simulate: (animal: string, time: 'Day' | 'Night' = 'Night', inside_crop_region = false) =>
    post<SimulationResult>('/simulate', { animal, time, inside_crop_region }),

  /** POST /scenario — set active scenario */
  setScenario: (animal: string) =>
    post<{ status: string; active_scenario: string }>('/scenario', { animal }),

  /** POST /sensor-trigger — send PIR motion event */
  sensorTrigger: (motion: boolean, location = 'north_boundary') =>
    post<{ status: string; motion: boolean; location: string }>('/sensor-trigger', {
      sensor: 'PIR',
      motion,
      location,
    }),

  /** POST /timeline/action — farmer marks an incident */
  timelineAction: (id: string, action: 'accept' | 'ignore' | 'override') =>
    post<{ status: string; id: string; action: string }>('/timeline/action', { id, action }),

  /** POST /device-action — trigger hardware outputs */
  deviceAction: (buzzer = false, red_light = false, siren = false) =>
    post<{ status: string; activated: string[] }>('/device-action', { buzzer, red_light, siren }),

  /** GET /reports/monthly — fetch monthly report PDF blob */
  getMonthlyReportBlob: async (): Promise<{ blob: Blob; filename: string }> => {
    const res = await fetch(`${BASE}/reports/monthly`);
    if (!res.ok) throw new Error(`Failed to fetch report: ${res.status}`);
    const blob = await res.blob();

    const contentDisposition = res.headers.get('content-disposition');
    let filename = parseContentDispositionFilename(contentDisposition);
    if (!filename) {
      console.warn("Content-Disposition missing filename. Using default filename.");
      filename = 'rakshak_ai_monthly_report.pdf';
    }

    return { blob, filename };
  },
};

