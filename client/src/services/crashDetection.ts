import type { CrashDetectionEvent } from '../types/app';
import { API_BASE_URL } from '../config/api';

export interface SensorStatus {
  supported: boolean;
  permissionGranted: boolean;
  monitoringActive: boolean;
  pwaBackgroundLimitationNotice: string;
}

export type CrashListener = (event: CrashDetectionEvent) => void;

class CrashDetectionManager {
  private isListening = false;
  private listeners: CrashListener[] = [];
  private lastHighImpactTime = 0;
  private postImpactSamples: number[] = [];
  private collectingPostImpact = false;

  // Confidence thresholds
  private readonly IMPACT_THRESHOLD_G = 4.2; // > 4.2 G-force
  private readonly POST_IMPACT_WINDOW_MS = 1500; // 1.5s post-impact motion check
  private readonly STOP_VARIANCE_MAX = 0.3; // Very low movement indicates stop

  public getStatus(): SensorStatus {
    const supported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
    return {
      supported,
      permissionGranted: this.isListening,
      monitoringActive: this.isListening,
      pwaBackgroundLimitationNotice:
        'Notice: Web browsers can monitor motion sensors while the application is open. Continuous background sensor tracking when the phone is locked requires a native companion application.'
    };
  }

  public async requestSensorPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      return false;
    }

    // iOS 13+ permission request
    const deviceMotion = window.DeviceMotionEvent as any;
    if (typeof deviceMotion.requestPermission === 'function') {
      try {
        const response = await deviceMotion.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
        return false;
      }
    }

    return true; // Android / standard desktop
  }

  public startMonitoring(): boolean {
    if (this.isListening) return true;
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      return false;
    }

    window.addEventListener('devicemotion', this.handleDeviceMotion, true);
    this.isListening = true;
    return true;
  }

  public stopMonitoring(): void {
    if (!this.isListening) return;
    window.removeEventListener('devicemotion', this.handleDeviceMotion, true);
    this.isListening = false;
  }

  public addListener(cb: CrashListener): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  // Allow manual simulation for Dev / Testing scenarios (Section 53)
  public simulateCrashEvent(confidence: 'MEDIUM' | 'HIGH' = 'HIGH'): CrashDetectionEvent {
    const event: CrashDetectionEvent = {
      eventId: `CRASH-SIM-${Date.now().toString(36).toUpperCase()}`,
      confidence,
      confidenceScore: confidence === 'HIGH' ? 0.88 : 0.65,
      impactForceG: confidence === 'HIGH' ? 5.2 : 3.8,
      speedDeltaKmph: 35,
      motionStopped: true,
      userResponse: 'DISMISSED',
      timestamp: new Date().toISOString()
    };

    // Log to backend
    fetch(`${API_BASE_URL}/api/crash/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {
      // Offline fallback
    });

    this.listeners.forEach((listener) => listener(event));
    return event;
  }

  private handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // Convert m/s^2 to Gs
    const totalAccMs2 = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const gForce = totalAccMs2 / 9.80665;

    const now = Date.now();

    // If currently collecting post-impact motion to test for stop
    if (this.collectingPostImpact) {
      this.postImpactSamples.push(gForce);
      if (now - this.lastHighImpactTime > this.POST_IMPACT_WINDOW_MS) {
        this.collectingPostImpact = false;
        this.evaluatePostImpact(gForce);
      }
      return;
    }

    // False Alarm Protection: Ignore mount vibrations and road bumps (< 4.2 Gs)
    if (gForce >= this.IMPACT_THRESHOLD_G) {
      this.lastHighImpactTime = now;
      this.collectingPostImpact = true;
      this.postImpactSamples = [gForce];
    }
  };

  private evaluatePostImpact(peakG: number) {
    if (this.postImpactSamples.length < 3) return;

    // Check variance of post-impact motion
    const mean = this.postImpactSamples.reduce((a, b) => a + b, 0) / this.postImpactSamples.length;
    const variance =
      this.postImpactSamples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      this.postImpactSamples.length;

    const motionStopped = variance <= this.STOP_VARIANCE_MAX;

    // High confidence requires both high impact AND stillness/stop
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let confidenceScore = 0.3;

    if (peakG >= 5.0 && motionStopped) {
      confidence = 'HIGH';
      confidenceScore = 0.92;
    } else if (peakG >= this.IMPACT_THRESHOLD_G && motionStopped) {
      confidence = 'HIGH';
      confidenceScore = 0.82;
    } else if (peakG >= this.IMPACT_THRESHOLD_G) {
      confidence = 'MEDIUM';
      confidenceScore = 0.6;
    }

    // Only alert on MEDIUM or HIGH confidence (Section 24)
    if (confidence === 'MEDIUM' || confidence === 'HIGH') {
      const crashEvent: CrashDetectionEvent = {
        eventId: `CRASH-${Date.now().toString(36).toUpperCase()}`,
        confidence,
        confidenceScore,
        impactForceG: Math.round(peakG * 10) / 10,
        motionStopped,
        userResponse: 'DISMISSED',
        timestamp: new Date().toISOString()
      };

      fetch(`${API_BASE_URL}/api/crash/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crashEvent)
      }).catch(() => {});

      this.listeners.forEach((listener) => listener(crashEvent));
    }
  }
}

export const crashDetector = new CrashDetectionManager();
