import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  identifier: string = '';
  otp: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) { }

  getOtp(): void {
    if (!this.identifier) {
      this.errorMessage = 'Please enter your Mobile/Aadhar/Email to get OTP.';
      return;
    }
    this.errorMessage = '';
    console.log(`OTP sent to ${this.identifier}`);
    // ✅ Store in localStorage
    localStorage.setItem('pendingVerification', JSON.stringify({ email: this.identifier }));

    // ✅ Navigate to OTP page
    this.router.navigate(['/verify-otp']);
  }

  loginWithPassword(): void {
    this.errorMessage = '';
    if (!this.identifier.trim() || !this.password) {
      this.errorMessage = 'Please enter both identifier and password.';
      return;
    }

    // 🟡 Replace with actual API call
    if (
      (this.identifier === 'user@example.com' || this.identifier === '123456789012') &&
      this.password === 'password123'
    ) {
      this.successMessage = 'Login successful!';
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid credentials. Please try again.';
    }
  }
}
