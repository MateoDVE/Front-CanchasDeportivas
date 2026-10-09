import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const login = () => router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  if (!auth.isLoggedIn()) return login();
  return auth.getProfile().pipe(map(user => {
    if (user.status !== 'ACTIVE') return login();
    const roles = route.data['roles'] as string[] | undefined;
    if (!roles?.length || roles.includes(user.role)) return true;
    return router.createUrlTree([user.role === 'ADMIN' ? '/admin' : user.role === 'SECRETARIA' ? '/secretary' : '/my-reservations']);
  }), catchError(() => of(login())));
};
