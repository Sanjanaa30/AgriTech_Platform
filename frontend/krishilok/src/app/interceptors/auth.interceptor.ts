import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service'; // ✅ Updated path
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' // ✅ Required for standalone apps
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('⚠️ Access token might have expired. Trying to refresh...');

          return this.authService.refreshToken().pipe(
            switchMap(() => {
              console.log('✅ Token refreshed successfully.');
              return next.handle(req);
            }),
            catchError(refreshError => {
              console.error('❌ Refresh token failed. Forcing logout.');
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
