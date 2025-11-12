import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/AuthService.service';

/**
 * Functional route guard that redirects unauthenticated users to /login.
 * Usage: canActivate: [AuthGuard]
 */
export const AuthGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isAuth = auth.isAuthenticated();
  if (isAuth) return true;
  // return a UrlTree to redirect to login
  return router.parseUrl('/login') as unknown as boolean | UrlTree;
};

export default AuthGuard;
