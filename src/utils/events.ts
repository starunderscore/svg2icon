// Simple EventManager (pub/sub)
export type Handler = (payload?: any) => void;

export class EventManager {
  private listeners: Map<string, Set<Handler>> = new Map();

  on(event: string, handler: Handler): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload?: any): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const h of Array.from(handlers)) {
      try { h(payload); } catch (e) { console.error('Event handler error', e); }
    }
  }
}

