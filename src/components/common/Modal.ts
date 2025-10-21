// Minimal Modal base class for renderer

interface ModalOptions {
  title: string;
  size?: 'small' | 'medium' | 'large' | 'fullwidth';
  className?: string;
  showClose?: boolean;
}

export abstract class Modal {
  protected options: ModalOptions;
  private container: HTMLElement | null = null;
  private resolver: ((value: any) => void) | null = null;
  private result: any = true;

  constructor(options: ModalOptions) {
    this.options = { showClose: true, size: 'medium', ...options };
  }

  async show(): Promise<any> {
    const root = document.getElementById('modal-container');
    if (!root) throw new Error('Modal container not found');

    this.container = document.createElement('div');
    this.container.className = `modal is-active ${this.options.className || ''}`;
    this.container.innerHTML = `
      <div class="modal-background"></div>
      <div class="modal-card modal-${this.options.size}">
        <header class="modal-card-head">
          <p class="modal-card-title">${this.options.title}</p>
          ${this.options.showClose ? '<button class="delete" aria-label="close" data-action="cancel"></button>' : ''}
        </header>
        <section class="modal-card-body">${this.getContent()}</section>
        <footer class="modal-card-foot">${this.getFooterActions()}</footer>
      </div>`;

    root.appendChild(this.container);
    this.bindFooterActions();
    await this.onOpen?.();

    return new Promise(resolve => { this.resolver = resolve; });
  }

  protected abstract getContent(): string;
  protected getFooterActions(): string { return `<button class="button" data-action="close">Close</button>`; }
  protected async onOpen(): Promise<void> { /* optional */ }
  protected async onAction(_action: string): Promise<boolean> { return true; }

  protected setResult(value: any): void { this.result = value; }

  private bindFooterActions(): void {
    if (!this.container) return;
    this.container.addEventListener('click', async (e) => {
      const el = e.target as HTMLElement;
      const action = el?.getAttribute('data-action');
      if (!action) return;
      e.preventDefault();
      const ok = await this.onAction(action);
      if (ok) this.close();
    });
  }

  close(): void {
    if (!this.container) return;
    this.container.classList.remove('is-active');
    this.container.remove();
    const resolve = this.resolver;
    this.resolver = null;
    resolve?.(this.result);
  }
}

