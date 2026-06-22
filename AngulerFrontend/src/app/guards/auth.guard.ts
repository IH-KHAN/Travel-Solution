import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Decode JWT payload and check expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        // Token has expired — clean up and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('userName');
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url, expired: true } });
        return false;
      }
    } catch {
      // Malformed token — treat as invalid
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }

    // Check route roles if defined
    const expectedRoles = route.data['roles'] as string[];
    if (expectedRoles && expectedRoles.length > 0) {
      const userRole = localStorage.getItem('role');
      if (!userRole || !expectedRoles.includes(userRole)) {
        if (userRole === 'Agent') {
          this.router.navigate(['/agent/dashboard']);
        } else {
          this.router.navigate(['/login']); // Redirect to login to avoid infinite loop with '/'
        }
        return false;
      }
    }

    return true;
  }
}
