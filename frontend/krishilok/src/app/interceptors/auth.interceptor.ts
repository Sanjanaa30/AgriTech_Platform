import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Forward request and catch errors
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // 🔁 If access token failed, attempt refresh ONCE
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          console.warn('⚠️ Access token might have expired. Trying to refresh...');

          return this.authService.refreshToken().pipe(
            switchMap(() => {
              console.log('✅ Token refreshed successfully.');
              this.authService.setAuthenticated(true); // ✅ Re-mark session as authenticated
              this.isRefreshing = false;
              return next.handle(req); // 🔁 Retry original request
            }),
            catchError(refreshError => {
              console.error('❌ Refresh token failed. Forcing logout.');
              this.isRefreshing = false;
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        // ❌ Avoid repeated refresh attempts on subsequent 401s
        if (error.status === 401 && this.isRefreshing) {
          console.warn('🔁 Skipping refresh — already in progress.');
        }

        return throwError(() => error);
      })
    );
  }
}
