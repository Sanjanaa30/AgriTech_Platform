import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.checkAuth().pipe(
      map((res) => {
        const isAuthenticated = !!res?.user;
        console.log('✅ AuthGuard allowed access:', res);
        return isAuthenticated;
      }),
      catchError((err) => {
        console.warn('🚫 AuthGuard denied access:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }

  canActivateChild(): Observable<boolean> {
    return this.canActivate();
  }
}
