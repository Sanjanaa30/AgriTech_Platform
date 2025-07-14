import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface AuthCheckResponse {
  message: string;
  user: {
    userId: string;
    username: string;
    // add other fields like email, role, etc.
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private authenticated = false;
  private isLoggingOut = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) { }

  registerUser(userData: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/pre-register`, userData, {
      withCredentials: true,
    });
  }

  verifyAndRegister(payload: { userData: any; otp: string }): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/register-after-otp`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.authenticated = true;
          console.log('✅ Registration completed and authenticated.');
        })
      );
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/resend-otp`,
      { email },
      { withCredentials: true }
    );
  }

  loginWithPassword(identifier: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/login-password`, { identifier, password }, { withCredentials: true })
      .pipe(
        tap(() => {
          this.authenticated = true;
          console.log('🔐 Logged in with password.');
        })
      );
  }

  loginWithOtp(identifier: string, otp: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/login-otp`, { identifier, otp }, { withCredentials: true })
      .pipe(
        tap(() => {
          this.authenticated = true;
          console.log('🔐 Logged in with OTP.');
        })
      );
  }

  logLoginAttempt(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-attempt`, data, { withCredentials: true });
  }

  checkAuth(): Observable<AuthCheckResponse> {
    return this.http.get<AuthCheckResponse>(`${this.baseUrl}/check-auth`, {
      withCredentials: true,
    });
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authenticated = true;
        console.log('🔁 Refresh token called from auth.service');
      })
    );
  }

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => console.log('👋 Logged out successfully.'),
      error: (err) => console.error('❌ Logout failed:', err),
      complete: () => {
        this.authenticated = false;

        // ✅ CLEAR ALL RESIDUAL AUTH STATE
        sessionStorage.clear();
        localStorage.clear();

        // ✅ Replace login route to prevent back navigation
        this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload(); // ✅ hard reload ensures no token leak
          }
          this.isLoggingOut = false;
        });
      },
    });
  }



  setAuthenticated(status: boolean): void {
    this.authenticated = status;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  restoreAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) return; // 🛡 SSR safety
    if (this.isLoggingOut) {
      console.warn('🛑 Skipping restore — logout in progress.');
      return;
    }

    this.checkAuth().subscribe({
      next: (res) => {
        this.authenticated = true;
        console.log('✅ Session restored. User:', res.user?.userId);
      },
      error: () => {
        this.authenticated = false;
        console.warn('🔒 Not authenticated on restore.');
      }
    });
  }

}
