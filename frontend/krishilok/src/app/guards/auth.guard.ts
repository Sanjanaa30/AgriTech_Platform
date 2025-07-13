import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.authService.checkAuth().pipe(
      map((res) => {
        console.log('✅ AuthGuard allowed access:', res);
        return true;
      }),
      catchError((err) => {
        console.warn('🚫 AuthGuard denied access:', err);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
