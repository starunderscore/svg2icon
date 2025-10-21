// TelemetryService - Anonymous usage analytics

export class TelemetryService {
  private posthog: any = null;
  private enabled = false;
  private userId: string;
  private sessionId: string;

  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.generateSessionId();
  }

  async initialize(enabled: boolean = true): Promise<void> {
    this.enabled = enabled;
    
    if (!this.enabled || this.posthog) {
      return;
    }

    try {
      await this.loadPostHogScript();
      
      (window as any).posthog.init('phc_W5QhQVXMO1o8TxQeVEC1valqkYPJIPdW3vwTGkJYTrh', {
        api_host: 'https://app.posthog.com',
        capture_pageview: false,
        capture_pageleave: false,
        loaded: (posthogInstance: any) => {
          console.log('PostHog loaded successfully');
          this.posthog = posthogInstance;
          this.track('app_opened', this.getSystemInfo());
        },
        bootstrap: {
          distinctID: this.userId
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  private loadPostHogScript(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://app.posthog.com/static/array.js';
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.enabled || !this.posthog) {
      return;
    }

    try {
      this.posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        app_version: '1.1.0',
        session_id: this.sessionId
      });
      console.log('Tracked event:', eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  disable(): void {
    if (this.posthog) {
      try {
        this.track('telemetry_disabled');
        this.posthog.opt_out_capturing();
        this.posthog = null;
        this.enabled = false;
        console.log('Telemetry disabled');
      } catch (error) {
        console.error('Error disabling telemetry:', error);
      }
    }
  }

  enable(): void {
    this.enabled = true;
    this.initialize(true);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('svg2icon_userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('svg2icon_userId', userId);
    }
    return userId;
  }

  private getSystemInfo(): Record<string, any> {
    return {
      app_name: 'svg2icon',
      version: '1.1.0',
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}