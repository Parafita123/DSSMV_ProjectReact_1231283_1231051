export type ChangeListener = () => void;

/**
 * BaseStore com listeners "unsubscribe-safe".
 * addChangeListener devolve SEMPRE uma função cleanup (unsubscribe),
 * para ser usado diretamente no useEffect sem erros de typing.
 */
export class BaseStore {
  private listeners: Set<ChangeListener> = new Set();

  protected emitChange() {
    for (const l of Array.from(this.listeners)) {
      try {
        l();
      } catch (e) {
        // não crashar o app por causa de um listener
        console.error("Store listener error:", e);
      }
    }
  }

  /**
   * Adiciona listener e devolve cleanup function.
   * o q o useEffect espera
   */
  public addChangeListener(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public removeChangeListener(listener: ChangeListener): void {
    this.listeners.delete(listener);
  }
}
