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
    // 🚫 If token already exists, go to dashboard
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Step 1: Send OTP
  sendOtp(): void {
    if (!this.identifier) {
      this.errorMessage = 'Please enter your identifier (email/mobile/aadhaar).';
      return;
    }

    this.identifier = this.identifier.trim(); // 🧼 Sanitize input

    this.authService.resendOtp(this.identifier).subscribe({
      next: () => {
        this.successMessage = 'OTP sent successfully.';
        this.errorMessage = '';
        this.otpSent = true;
        this.otp = ''; // Clear previous OTP input

        // 🔍 Auto-focus OTP field after slight delay
        setTimeout(() => {
          const otpInput = document.querySelector('input[name="otp"]') as HTMLInputElement;
          otpInput?.focus();
        }, 100);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to send OTP.';
        this.successMessage = '';
      }
    });
  }

  // Step 2: Verify OTP
  verifyOtp(): void {
    if (!this.identifier || !this.otp) {
      this.errorMessage = 'Please enter the OTP and identifier.';
      return;
    }

    this.identifier = this.identifier.trim();
    this.isLoading = true;
    this.successMessage = 'Verifying...';
    this.errorMessage = '';

    this.authService.loginWithOtp(this.identifier, this.otp).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.successMessage = 'OTP verified! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid or expired OTP.';
        this.successMessage = '';
        this.isLoading = false;
      }
    });
  }

  loginWithPassword(): void {
    if (!this.identifier || !this.password) {
      this.errorMessage = 'Please enter both identifier and password.';
      return;
    }

    this.identifier = this.identifier.trim();

    this.authService.loginWithPassword(this.identifier, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.successMessage = 'Login successful!';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid credentials.';
        this.successMessage = '';
      }
    });
  }
}
