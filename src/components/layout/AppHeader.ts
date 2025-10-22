// AppHeader component - Top navigation bar

interface AppHeaderProps {
  onNewProject: () => void;
  onSettings: () => void;
}

export class AppHeader {
  private props: AppHeaderProps;
  private container: HTMLElement | null = null;
  private projectCount = 0;

  constructor(props: AppHeaderProps) {
    this.props = props;
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.updateHTML();
    this.attachEventListeners();
  }

  updateProjectCount(count: number): void {
    this.projectCount = count;
    // count now shown in footer
  }

  private updateHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="header-content">
        <div class="header-left">
          <button class="btn-new-project" type="button">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New SVG
          </button>
        </div>
        
        <div class="header-right">
          <button class="btn-settings" type="button" title="Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    const settingsBtn = this.container.querySelector('.btn-settings');
    const newProjectBtn = this.container.querySelector('.btn-new-project');

    settingsBtn?.addEventListener('click', () => {
      this.props.onSettings();
    });
    newProjectBtn?.addEventListener('click', () => {
      this.props.onNewProject();
    });
  }
}
