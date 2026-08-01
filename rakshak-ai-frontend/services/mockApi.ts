export interface ScenarioResult {
  id: string;
  animal: string;
  confidence: number;
  position: { x: number; y: number };
  direction: string;
  distanceToCrop: number; // meters
  eta: number; // seconds
  threat: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  response: string[];
  emoji: string;
  timestamp: string;
}

export interface SystemStatus {
  farm: 'safe' | 'caution' | 'alert';
  system: 'active' | 'idle';
  camera: 'standby' | 'active';
  motion: 'waiting' | 'detected';
  ai: 'ready' | 'analyzing' | 'complete';
}

const PRESET_SCENARIOS: Record<string, Omit<ScenarioResult, 'id' | 'timestamp'>> = {
  'Wild Boar': {
    animal: 'Wild Boar',
    confidence: 94,
    position: { x: 78, y: 65 },
    direction: 'SW (Toward Crop)',
    distanceToCrop: 12,
    eta: 18,
    threat: 'CRITICAL',
    reason: 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility night hours.',
    response: ['Flash High-Intensity Lights', 'Fire High-Decibel Siren', 'Notify Farmer via SMS/App'],
    emoji: '🐗',
  },
  'Cow': {
    animal: 'Cow',
    confidence: 89,
    position: { x: 70, y: 25 },
    direction: 'S (Slow Grazing)',
    distanceToCrop: 28,
    eta: 45,
    threat: 'MEDIUM',
    reason: 'Stray cattle grazing in perimeter buffer zone, slow movement detected near boundary fence.',
    response: ['Activate Ultrasonic Repellent', 'Soft Strobe Illumination'],
    emoji: '🐄',
  },
  'Nilgai': {
    animal: 'Nilgai',
    confidence: 91,
    position: { x: 85, y: 35 },
    direction: 'W (Rapid Approach)',
    distanceToCrop: 18,
    eta: 25,
    threat: 'HIGH',
    reason: 'Nilgai (Blue Bull) herd member breaching northern perimeter fence, high risk of crop trampling.',
    response: ['Flash High-Intensity Lights', 'Fire High-Decibel Siren', 'Deploy Drone Interceptor'],
    emoji: '🦌',
  },
  'Dog': {
    animal: 'Dog',
    confidence: 85,
    position: { x: 22, y: 82 },
    direction: 'NE (Outer Road)',
    distanceToCrop: 55,
    eta: 60,
    threat: 'LOW',
    reason: 'Stray domestic canine detected near farm outer road, moving parallel away from crop zone.',
    response: ['Audio Frequency Repellent'],
    emoji: '🐕',
  },
  'Human': {
    animal: 'Human Patrol',
    confidence: 96,
    position: { x: 18, y: 18 },
    direction: 'E (Outer Pathway)',
    distanceToCrop: 80,
    eta: 0,
    threat: 'SAFE',
    reason: 'Authorized farm worker / patrol human detected near outer gate pathway. No deterrence triggered.',
    response: ['Log Authorized Entry', 'Maintain Passive Surveillance'],
    emoji: '👤',
  },
};

export const runScenario = (scenarioName: string): Promise<ScenarioResult> => {
  return new Promise((resolve) => {
    const preset = PRESET_SCENARIOS[scenarioName] || PRESET_SCENARIOS['Wild Boar'];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTimeout(() => {
      resolve({
        ...preset,
        id: `evt-${Date.now()}`,
        timestamp: timeStr,
      });
    }, 800);
  });
};

export const getInitialStatus = (): SystemStatus => ({
  farm: 'safe',
  system: 'active',
  camera: 'standby',
  motion: 'waiting',
  ai: 'ready',
});
