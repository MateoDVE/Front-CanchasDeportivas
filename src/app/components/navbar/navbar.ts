import { Component, Input, computed, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  private confirmation = inject(ConfirmationService);

  @Input() currentPage: string = '';

  private currentUrl = signal<string>('');

  constructor() {
    this.currentUrl.set(this.router.url || '');
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.mobileOpen = false;
      }
    });
  }

  activePage = computed(() => {
    if (this.currentPage) return this.currentPage;
    const fullUrl = this.currentUrl() || this.router.url || '';
    const url = fullUrl.split('?')[0].split('#')[0];
    if (url.startsWith('/admin')) return 'admin';
    if (url.startsWith('/secretary')) return 'secretary';
    if (url.startsWith('/my-reservations')) return 'my-reservations';
    if (
      url.startsWith('/courts') ||
      url.startsWith('/court-detail') ||
      url.startsWith('/booking') ||
      url.startsWith('/payment')
    ) {
      return 'courts';
    }
    if (url === '/' || url === '') {
      if (fullUrl.includes('#como-funciona')) return 'how-it-works';
      return 'landing';
    }
    return 'landing';
  });

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  user = computed(() => this.authService.currentUser());
  userRole = computed(() => this.user()?.role);
  isAdmin = computed(() => this.userRole() === 'ADMIN');
  isSecretary = computed(() => this.userRole() === 'SECRETARIA' || this.userRole() === 'ADMIN');

  userInitials = computed(() => {
    const u = this.user();
    if (!u || !u.name) return 'U';
    const parts = u.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  });

  mobileOpen = false;

  closeMenu(toggle: HTMLButtonElement): void {
    this.mobileOpen = false;
    toggle.focus();
  }

  navigate(page: string): void {
    this.mobileOpen = false;

    switch (page) {
      case 'landing':
        this.router.navigate(['/']);
        break;
      case 'how-it-works':
        this.router.navigate(['/'], { fragment: 'como-funciona' }).then(() => {
          setTimeout(() => {
            const el = document.getElementById('como-funciona');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
        break;
      case 'courts':
        this.router.navigate(['/courts']);
        break;
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'my-reservations':
        if (this.isLoggedIn()) {
          this.router.navigate(['/my-reservations']);
        } else {
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-reservations' } });
        }
        break;
      case 'secretary':
        this.router.navigate(['/secretary']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
    }
  }

  async logout(): Promise<void> {
    if (!await this.confirmation.confirm({
      title: 'Cerrar sesión',
      message: '¿Quieres cerrar tu sesión de SportReserva? Tendrás que iniciar sesión para acceder a tu cuenta.',
      confirmText: 'Cerrar sesión',
    })) return;
    this.mobileOpen = false;
    this.authService.logout();
  }
}
