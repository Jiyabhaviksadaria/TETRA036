export type CameraStatus = 'online' | 'offline' | 'alert' | 'maintenance';

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  resolution: string;
  fps: number;
  ipAddress: string;
  streamUrl: string;
  activeAlertsCount: number;
  lastDetection: string;
}
