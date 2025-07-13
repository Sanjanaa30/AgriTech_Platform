import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthCheckResponse {
  message: string;
  user: {
    userId: string;
    username: string;
    // add other fields you expect, like email, role etc.
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private authenticated = false; // session-based flag

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/pre-register`, userData, { withCredentials: true });
  }

  verifyAndRegister(payload: { userData: any, otp: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register-after-otp`, payload, { withCredentials: true });
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/resend-otp`, { email }, { withCredentials: true });
  }

  loginWithPassword(identifier: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-password`, { identifier, password }, { withCredentials: true }).pipe(
      tap(() => {
        this.authenticated = true;
        console.log('🔐 Logged in with password.');
      })
    );
  }

  loginWithOtp(identifier: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-otp`, { identifier, otp }, { withCredentials: true }).pipe(
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
    return this.http.get<AuthCheckResponse>(`${this.baseUrl}/check-auth`, { withCredentials: true }).pipe(
      tap((res) => {
        this.authenticated = true;
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user)); // ⬅️ No TypeScript error now
        }
      })
    );
  }


  refreshToken(): Observable<any> {
    return this.http.post('/api/auth/refresh-token', {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('🔁 Refresh token called from auth.service');
      })
    );
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true }).subscribe({
      next: () => {
        this.authenticated = false;
        console.log('👋 Logged out successfully.');
      },
      error: () => {
        console.error('⚠️ Logout failed on server.');
      }
    });
  }

  isAuthenticated(): boolean {
    console.log(`🔍 isAuthenticated(): ${this.authenticated}`);
    return this.authenticated;
  }
}
