import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  form = {
    email: '',
    password: '',
  };

  loading = false;
  errorMessage = '';
  showPassword = false;

  handleSubmit(): void {
    if (!this.form.email || !this.form.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.form).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          const role = this.authService.currentUser()?.role;
          if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'SECRETARIA') {
            this.router.navigate(['/secretary']);
          } else {
            this.router.navigate(['/my-reservations']);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error && err.error.message) {
          this.errorMessage = Array.isArray(err.error.message)
            ? err.error.message.join(', ')
            : err.error.message;
        } else {
          this.errorMessage = 'Credenciales inválidas o error de conexión con el backend.';
        }
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  setDemoAccount(role: 'CLIENTE' | 'SECRETARIA' | 'ADMIN'): void {
    const accounts = {
      CLIENTE: { email: 'cliente@canchas.com', password: 'Cliente123!' },
      SECRETARIA: { email: 'secretaria@canchas.com', password: 'Secre123!' },
      ADMIN: { email: 'admin@canchas.com', password: 'Admin123!' },
    };
    this.form = { ...accounts[role] };
    this.errorMessage = '';
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }


}
