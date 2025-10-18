// TelemetryService.js
class TelemetryService {
  constructor() {
      this.posthog = null;
      this.enabled = false;
      this.userId = this.getOrCreateUserId();
      this.sessionId = this.generateSessionId();
  }

  async initialize(enabled = true) {
      this.enabled = enabled;
      
      if (!this.enabled || this.posthog) {
          return;
      }

      try {
          await this.loadPostHogScript();
          
          window.posthog.init('phc_W5QhQVXMO1o8TxQeVEC1valqkYPJIPdW3vwTGkJYTrh', {
              api_host: 'https://app.posthog.com',
              capture_pageview: false,
              capture_pageleave: false,
              loaded: (posthogInstance) => {
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

  loadPostHogScript() {
      return new Promise((resolve) => {
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          resolve();
      });
  }

  track(eventName, properties = {}) {
      if (!this.enabled || !this.posthog) {
          return;
      }

      try {
          this.posthog.capture(eventName, {
              ...properties,
              timestamp: new Date().toISOString(),
              app_version: '1.0.0',
              session_id: this.sessionId
          });
          console.log('Tracked event:', eventName, properties);
      } catch (error) {
          console.error('Failed to track event:', error);
      }
  }

  disable() {
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

  enable() {
      this.enabled = true;
      this.initialize(true);
  }

  generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getOrCreateUserId() {
      let userId = localStorage.getItem('iconGenerator_userId');
      if (!userId) {
          userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('iconGenerator_userId', userId);
      }
      return userId;
  }

  getSystemInfo() {
      return {
          app_name: 'svg2icon',
          version: '1.0.0',
          platform: navigator.platform,
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
  }
}

module.exports = TelemetryService;