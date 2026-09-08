import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly request = signal<ConfirmationOptions | null>(null);
  private resolve: ((confirmed: boolean) => void) | null = null;

  confirm(options: ConfirmationOptions): Promise<boolean> {
    // Ignore repeated clicks while the current decision is pending.
    if (this.resolve) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      this.resolve = resolve;
      this.request.set(options);
    });
  }

  answer(confirmed: boolean): void {
    const resolve = this.resolve;
    this.resolve = null;
    this.request.set(null);
    resolve?.(confirmed);
  }
}
