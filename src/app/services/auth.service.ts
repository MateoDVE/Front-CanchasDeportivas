import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginDto, RegisterDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals reactivas de estado
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isLoggedIn = computed(() => !!this.token());

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user_profile');

      if (storedToken) {
        this.token.set(storedToken);
      }
      if (storedUser) {
        try {
          this.currentUser.set(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user_profile');
        }
      }
    }
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((res) => {
        this.setSession(res);
      }),
    );
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, dto);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user_profile', JSON.stringify(user));
        }
      }),
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
    }

    this.router.navigate(['/login']);
  }

  private setSession(auth: AuthResponse): void {
    this.token.set(auth.accessToken);
    this.currentUser.set(auth.user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', auth.accessToken);
      localStorage.setItem('user_profile', JSON.stringify(auth.user));
    }
  }
}