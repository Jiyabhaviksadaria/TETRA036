import { Camera } from '@/types/camera';

export const mockCameras: Camera[] = [
  {
    id: 'cam-01',
    name: 'Zone B Orchard Perimeter',
    location: 'North Field Boundary',
    status: 'alert',
    resolution: '4K Ultra HD',
    fps: 60,
    ipAddress: '192.168.1.101',
    streamUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    activeAlertsCount: 2,
    lastDetection: '30 sec ago',
  },
  {
    id: 'cam-02',
    name: 'Zone A Corn Field East',
    location: 'East Fence Sector 2',
    status: 'online',
    resolution: '4K HDR Thermal',
    fps: 60,
    ipAddress: '192.168.1.102',
    streamUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?q=80&w=1200&auto=format&fit=crop',
    activeAlertsCount: 0,
    lastDetection: '12 mins ago',
  },
  {
    id: 'cam-03',
    name: 'Airborne Sentinel Drone 01',
    location: 'South Pasture Aerial',
    status: 'online',
    resolution: '4K Thermal Spectrum',
    fps: 120,
    ipAddress: '192.168.1.103',
    streamUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
    activeAlertsCount: 1,
    lastDetection: '4 mins ago',
  },
  {
    id: 'cam-04',
    name: 'Zone C Wheat Field West',
    location: 'West Irrigation Gate',
    status: 'online',
    resolution: '1080p AI Vision',
    fps: 30,
    ipAddress: '192.168.1.104',
    streamUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200&auto=format&fit=crop',
    activeAlertsCount: 0,
    lastDetection: '1 hour ago',
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
