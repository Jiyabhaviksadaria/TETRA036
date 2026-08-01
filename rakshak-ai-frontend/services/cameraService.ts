import { Camera } from '@/types/camera';

export const mockCameras: Camera[] = [
  {
    id: 'cam-01',
    name: 'Sector 4 Perimeter PTZ',
    location: 'North Outer Wall',
    status: 'alert',
    resolution: '4K Ultra HD',
    fps: 60,
    ipAddress: '192.168.1.101',
    streamUrl: '/mock-stream-1.mp4',
    activeAlertsCount: 2,
    lastDetection: '2 mins ago',
  },
  {
    id: 'cam-02',
    name: 'East Entrance Dome',
    location: 'Gate 2 Clearance Zone',
    status: 'online',
    resolution: '1080p Full HD',
    fps: 30,
    ipAddress: '192.168.1.102',
    streamUrl: '/mock-stream-2.mp4',
    activeAlertsCount: 0,
    lastDetection: '1 hour ago',
  },
  {
    id: 'cam-03',
    name: 'Main Concourse Thermal',
    location: 'Central Atrium',
    status: 'online',
    resolution: '1080p Thermal',
    fps: 30,
    ipAddress: '192.168.1.103',
    streamUrl: '/mock-stream-3.mp4',
    activeAlertsCount: 1,
    lastDetection: '15 mins ago',
  },
];

export const cameraService = {
  async getCameras(): Promise<Camera[]> {
    return Promise.resolve(mockCameras);
  },
  async getCameraById(id: string): Promise<Camera | undefined> {
    return Promise.resolve(mockCameras.find((c) => c.id === id));
  },
};
