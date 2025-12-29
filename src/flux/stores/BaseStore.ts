type Listener = () => void;

export class BaseStore {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  protected emitChange() {
    this.listeners.forEach((l) => l());
  }
}
