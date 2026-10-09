import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="max-w-md mx-auto p-6 my-12 bg-white rounded-2xl border border-slate-200">
      <h1 class="text-2xl font-bold">Verifica tu correo</h1>
      <p class="my-4">Abre el enlace que enviamos a tu correo. Debes verificarlo antes de iniciar sesión. El enlace vence en 30 minutos.</p>
      @if (message) { <p role="status" class="my-4 text-emerald-800">{{ message }}</p> }
      @if (error) { <p role="alert" class="my-4 text-rose-700">{{ error }}</p> }
      @if (token && !verified) {
        <button (click)="verify()" [disabled]="loading" class="w-full p-3 bg-emerald-600 text-white rounded-xl">Confirmar mi correo</button>
      }
      @if (!verified) {
        <form (ngSubmit)="resend()" class="my-4">
          <label for="verificationEmail">Correo electrónico</label>
          <input id="verificationEmail" name="email" type="email" [(ngModel)]="email" required class="w-full border rounded-xl p-3 my-2" />
          <button [disabled]="loading" class="w-full p-3 border rounded-xl">Reenviar enlace</button>
        </form>
      }
      <a routerLink="/login" class="block mt-4 text-emerald-700 underline">Ir a iniciar sesión</a>
    </main>
  `,
})
export class VerifyEmailComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly platform = inject(PLATFORM_ID);
  email = '';
  token = '';
  message = '';
  error = '';
  loading = false;
  verified = false;
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platform)) return;
    const params = new URLSearchParams(location.hash.slice(1));
    this.email = params.get('email') || history.state?.email || '';
    this.token = params.get('token') || '';
    if (this.token) history.replaceState(history.state, '', location.pathname);
  }
  verify(): void {
    if (this.loading || !this.token) return;
    this.loading = true; this.error = '';
    this.auth.verifyEmail(this.email, this.token).subscribe({
      next: result => { this.message = result.message; this.verified = true; this.token = ''; this.loading = false; },
      error: err => { this.error = err.error?.message || 'No se pudo verificar el correo.'; this.loading = false; },
    });
  }
  resend(): void {
    if (this.loading || !this.email.trim()) return;
    this.loading = true; this.error = ''; this.message = '';
    this.auth.resendVerification(this.email).subscribe({
      next: result => { this.message = result.message; this.loading = false; },
      error: err => { this.error = err.error?.message || 'No se pudo reenviar el correo.'; this.loading = false; },
    });
  }
}
