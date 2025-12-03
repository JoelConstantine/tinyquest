/**
 * Lightweight pub/sub event system.
 *
 * Allows subscribing to named events and emitting them with arbitrary
 * arguments. Subscribers are stored per-event name and invoked in order.
 */
export class EventSystem {
    public subscribers: Map<string, Function[]> = new Map<string, Function[]>();

    public subscribe(event: string, callback: Function) {
        if (!this.subscribers.has(event)) this.subscribers.set(event, []);
        this.subscribers.get(event)?.push(callback);
    }

    public unsubscribe(event: string, callback: Function) {
        if (!this.subscribers.has(event)) return;
        if (!this.subscribers.get(event)?.includes(callback)) return;
        this.subscribers.get(event)?.splice(this.subscribers.get(event)!.indexOf(callback), 1);
    }

    public emit(event: string, ...args: any[]) {
        if (!this.subscribers.has(event)) return;
        this.subscribers.get(event)?.forEach((callback) => callback(...args));
    }
}