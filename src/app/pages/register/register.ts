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
    name: '',
    phone: '',
    ci: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  handleSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.name || !this.form.email || !this.form.phone || !this.form.ci || !this.form.password) {
      this.errorMessage = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    if (this.form.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;

    this.authService
      .register({
        name: this.form.name,
        email: this.form.email,
        phone: this.form.phone,
        ci: this.form.ci,
        password: this.form.password,
      })
      .subscribe({
        next: () => {
          // Loguear automáticamente tras el registro exitoso
          this.authService
            .login({
              email: this.form.email,
              password: this.form.password,
            })
            .subscribe({
              next: () => {
                this.loading = false;
                this.router.navigate(['/courts']);
              },
              error: () => {
                this.loading = false;
                this.router.navigate(['/login']);
              },
            });
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