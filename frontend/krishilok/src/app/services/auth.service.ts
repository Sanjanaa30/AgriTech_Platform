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
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, userData);
  }

  verifyEmailOtp(payload: { email: string; otp: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/verify-otp`, payload);
  }

  checkVerification(email: string): Observable<{ isVerified: boolean }> {
    return this.http.get<{ isVerified: boolean }>(`${this.baseUrl}/check-verification/${email}`);
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/resend-otp`, { email });
  }
}

