import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSelectorComponent, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  identifier: string = '';
  otp: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  otpSent: boolean = false;
  isLoading: boolean = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token && this.authService.isTokenValid(token)) {
      this.successMessage = 'Already logged in. Redirecting...';
      setTimeout(() => this.router.navigate(['/dashboard']), 500);
    }
  }

  sendOtp(): void {
    this.clearMessages();

    if (!this.identifier.trim()) {
      this.errorMessage = 'Please enter your identifier (email/mobile/aadhaar).';
      return;
    }

    this.identifier = this.identifier.trim();

    this.authService.resendOtp(this.identifier).subscribe({
      next: () => {
        this.successMessage = 'OTP sent successfully.';
        this.otpSent = true;
        this.otp = '';

        setTimeout(() => {
          const otpInput = document.querySelector('input[name="otp"]') as HTMLInputElement;
          otpInput?.focus();
        }, 100);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(): void {
    this.clearMessages();

    if (!this.identifier || !this.otp) {
      this.errorMessage = 'Please enter both identifier and OTP.';
      return;
    }

    if (!/^\d{6}$/.test(this.otp)) {
      this.errorMessage = 'OTP must be a 6-digit number.';
      return;
    }

    this.identifier = this.identifier.trim();
    this.isLoading = true;
    this.successMessage = 'Verifying...';

    this.authService.loginWithOtp(this.identifier, this.otp).subscribe({
      next: (res) => {
        this.trackLoginAttempt(true, 'otp');
        this.storeToken(res.token);
        this.successMessage = 'OTP verified! Redirecting...';
        const role = res.role?.[0];
        setTimeout(() => {
          if (role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (role === 'buyer') {
            this.router.navigate(['/buyer-dashboard']);
          } else {
            this.router.navigate(['/dashboard']); // farmer
          }
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        this.trackLoginAttempt(false, 'otp');
        this.errorMessage = err.error?.message || 'Invalid or expired OTP.';
        this.isLoading = false;
      }
    });
  }

  loginWithPassword(): void {
    this.clearMessages();

    if (!this.identifier || !this.password) {
      this.errorMessage = 'Please enter both identifier and password.';
      return;
    }

    this.identifier = this.identifier.trim();

    this.authService.loginWithPassword(this.identifier, this.password).subscribe({
      next: (res) => {
        this.trackLoginAttempt(true, 'password');
        this.storeToken(res.token);
        this.successMessage = 'Login successful!';

        const role = res.role?.[0]; // assuming role is an array
        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'buyer') {
          this.router.navigate(['/buyer-dashboard']);
        } else {
          this.router.navigate(['/dashboard']); // farmer
        }
      },
      error: (err) => {
        this.trackLoginAttempt(false, 'password');
        this.errorMessage = err.error?.message || 'Invalid credentials.';
      }
    });
  }

  storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      if (this.rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  trackLoginAttempt(success: boolean, method: 'otp' | 'password'): void {
    const deviceInfo = `${navigator.userAgent}`;
    const timestamp = new Date().toISOString();

    const data = {
      identifier: this.identifier,
      method,
      success,
      timestamp,
      deviceInfo
      // IP is auto-tracked by backend via req.ip
    };

    this.authService.logLoginAttempt(data).subscribe({
      next: () => console.log(`📍 Login ${success ? 'success' : 'fail'} tracked.`),
      error: (err) => console.warn('⚠️ Login tracking failed:', err)
    });
  }
}
