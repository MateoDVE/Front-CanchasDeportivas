import { Component, Input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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

  @Input() currentPage: string = 'landing';

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

  navigate(page: string): void {
    this.mobileOpen = false;

    switch (page) {
      case 'landing':
        this.router.navigate(['/']);
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

  logout(): void {
    this.mobileOpen = false;
    this.authService.logout();
  }
}