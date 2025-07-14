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
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const publicRoutes = ['/login', '/register', '/verify-otp', '/'];
        const currentUrl = this.router.url;
        const isPublic = publicRoutes.some(route => currentUrl.startsWith(route));

        // 🔒 Unauthorized error (likely token expired)
        if (error.status === 401) {
          if (!this.isRefreshing && !isPublic) {
            this.isRefreshing = true;
            console.warn('⚠️ Access token might have expired. Trying to refresh...');

            return this.authService.refreshToken().pipe(
              switchMap(() => {
                console.log('✅ Token refreshed successfully.');
                this.authService.setAuthenticated(true);
                this.isRefreshing = false;
                return next.handle(req.clone()); // 🔁 Retry request
              }),
              catchError((refreshError) => {
                console.error('❌ Refresh token failed. Forcing logout.');
                this.isRefreshing = false;
                this.authService.logout();
                return throwError(() => refreshError);
              })
            );
          } else if (this.isRefreshing && !isPublic) {
            console.warn('🔁 Skipping refresh — already in progress.');
          } else if (isPublic) {
            console.warn('🛑 Skipping refresh — on public route:', currentUrl);
          }

          return throwError(() => error); // 🚫 Don't retry on public or already refreshing
        }

        // Other errors — pass through
        return throwError(() => error);
      })
    );
  }
}
