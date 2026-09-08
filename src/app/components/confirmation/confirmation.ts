import { afterRenderEffect, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  template: `
    <dialog #dialog aria-labelledby="confirmation-title" aria-describedby="confirmation-description"
      (cancel)="$event.preventDefault(); finish(false)">
      @if (confirmation.request(); as request) {
        <div class="symbol" [class.danger]="request.danger" aria-hidden="true">{{ request.danger ? '!' : '?' }}</div>
        <h2 id="confirmation-title">{{ request.title }}</h2>
        <p id="confirmation-description">{{ request.message }}</p>
        <div class="actions">
          <button type="button" autofocus (click)="finish(false)">{{ request.cancelText || 'Cancelar' }}</button>
          <button type="button" class="confirm" [class.danger]="request.danger" (click)="finish(true)">
            {{ request.confirmText || 'Confirmar' }}
          </button>
        </div>
      }
    </dialog>
  `,
  styles: `
    dialog { margin: auto; width: min(440px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow: auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 20px; color: #0f172a; background: white; box-shadow: 0 24px 80px #0f172a33; }
    dialog::backdrop { background: #0f172a88; backdrop-filter: blur(4px); }
    .symbol { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: #d1fae5; color: #047857; font-size: 26px; font-weight: 700; margin-bottom: 18px; }
    .symbol.danger { background: #ffe4e6; color: #be123c; }
    h2 { font-size: 22px; font-weight: 700; margin: 0 0 10px; }
    p { color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 24px; overflow-wrap: anywhere; white-space: pre-line; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    button { min-height: 44px; padding: 10px 18px; border: 1px solid #cbd5e1; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; background: #f8fafc; color: #334155; }
    button:hover { background: #e2e8f0; }
    button:focus-visible { outline: 3px solid #34d399; outline-offset: 3px; }
    .confirm { background: #047857; border-color: transparent; color: white; }
    .confirm:hover { background: #065f46; }
    .confirm.danger { background: #be123c; }
    .confirm.danger:hover { background: #9f1239; }
  `,
})
export class ConfirmationComponent implements OnDestroy {
  readonly confirmation = inject(ConfirmationService);
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.confirmation.request() && !dialog.open) dialog.showModal();
      else if (!this.confirmation.request() && dialog.open) dialog.close();
    });
  }

  finish(confirmed: boolean): void {
    this.dialog().nativeElement.close();
    this.confirmation.answer(confirmed);
  }

  ngOnDestroy(): void {
    this.confirmation.answer(false);
  }
}
