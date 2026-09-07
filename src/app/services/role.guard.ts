import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentUser = authService.currentUser();
  const currentRole = currentUser?.role;

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  // Redirigir según rol si intenta acceder a una ruta para la que no tiene permisos
  if (currentRole === 'ADMIN') {
    router.navigate(['/admin']);
  } else if (currentRole === 'SECRETARIA') {
    router.navigate(['/secretary']);
  } else {
    router.navigate(['/my-reservations']);
  }

  return false;
};
