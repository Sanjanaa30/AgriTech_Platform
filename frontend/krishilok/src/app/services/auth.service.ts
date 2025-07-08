import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/pre-register`, userData);
  }

  verifyAndRegister(payload: { userData: any, otp: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register-after-otp`, payload);
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/resend-otp`, { email });
  }

  loginWithPassword(identifier: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-password`, { identifier, password });
  }

  loginWithOtp(identifier: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-otp`, { identifier, otp });
  }

  logLoginAttempt(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-attempt`, data);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload && payload.exp && Date.now() < payload.exp * 1000;
    } catch (e) {
      return false;
    }
  }
}

