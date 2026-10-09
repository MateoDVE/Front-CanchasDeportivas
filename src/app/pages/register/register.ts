import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  form = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  handleSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.firstName.trim() || !this.form.lastName.trim() || !this.form.email || !this.form.phone || !this.form.password) {
      this.errorMessage = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authService
      .register({
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        email: this.form.email,
        phone: this.form.phone,
        password: this.form.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/verify-email'], { state: { email: this.form.email } });
        },
        error: (err) => {
          this.loading = false;
          if (err.error && err.error.message) {
            this.errorMessage = Array.isArray(err.error.message)
              ? err.error.message.join(', ')
              : err.error.message;
          } else {
            this.errorMessage = 'Error al registrar la cuenta en el servidor.';
          }
        },
      });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}