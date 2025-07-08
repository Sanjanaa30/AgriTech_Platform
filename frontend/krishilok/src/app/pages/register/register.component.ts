import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import stateDistrictData from '../../../assets/states-districts.json';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  showPassword = false;
  passwordFocused = false;
  passwordTouched = false;
  passwordValid = false;
  passwordError = false;
  isSubmitting: boolean = false;
  remainingRules: string[] = [];
  submissionInProgress = false;
  hasSubmitted: boolean = false;
  private unloadBlocked = false;
  private backBlocked = false;

  formData = {
    firstName: '',
    lastName: '',
    mobile: '',
    aadhaar: '',
    email: '',
    password: '',
    role: '',
    state: '',
    district: ''
  };

  states: string[] = [];
  districts: string[] = [];
  aadharRaw: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.states = Object.keys(stateDistrictData);

    if (isPlatformBrowser(this.platformId)) {
      const inProgress = localStorage.getItem('registrationInProgress') === 'true';

      if (inProgress) {
        if (window.history.state === null) {
          history.pushState({ page: 'register' }, '', location.href);
        }
        window.addEventListener('beforeunload', this.confirmUnload);
        window.addEventListener('popstate', this.confirmBack);
      }
    }
  }


  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.confirmUnload);
      window.removeEventListener('popstate', this.confirmBack);
    }
  }


  confirmUnload = (event: BeforeUnloadEvent) => {
    if (!this.unloadBlocked && this.hasSubmitted && !this.successMessage) {
      this.unloadBlocked = true;
      event.preventDefault();
      event.returnValue = '';
      setTimeout(() => {
        this.unloadBlocked = false;
      }, 1000);
    }
  };


  confirmBack = () => {
    if (!this.backBlocked && this.hasSubmitted && !this.successMessage) {
      this.backBlocked = true;
      const confirmLeave = window.confirm(
        '⚠️ Your registration is in progress. Are you sure you want to leave this page?'
      );

      if (!confirmLeave) {
        if (window.history.state === null) {
          history.pushState({ page: 'register' }, '', location.href);
        }
      } else {
        window.removeEventListener('beforeunload', this.confirmUnload);
        window.removeEventListener('popstate', this.confirmBack);
      }

      setTimeout(() => {
        this.backBlocked = false;
      }, 1000);
    }
  };


  onStateChange(state: string) {
    this.formData.district = '';
    this.districts = (stateDistrictData as any)[state] || [];
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  onMobileInput(event: any): void {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    this.formData.mobile = digitsOnly;
  }

  onAadharInput(event: any): void {
    const input = event.target.value.replace(/\D/g, '');
    this.aadharRaw = input.slice(0, 12);
    this.formData.aadhaar = this.formatAadhar(this.aadharRaw);
  }

  formatAadhar(value: string): string {
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    return parts.join('-');
  }

  isValidAadhar(): boolean {
    return /^\d{12}$/.test(this.aadharRaw);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordRules = [
    { test: /[A-Z]/, label: 'At least one uppercase letter' },
    { test: /[a-z]/, label: 'At least one lowercase letter' },
    { test: /\d/, label: 'At least one number' },
    { test: /[@$!%*?&]/, label: 'At least one special character (@$!%*?&)' },
    { test: /^[A-Za-z\d@$!%*?&]+$/, label: 'Only allowed characters (no spaces)' }
  ];

  onPasswordFocus(): void {
    this.passwordFocused = true;
    this.passwordTouched = false;
    this.validatePassword();
  }

  onPasswordBlur(): void {
    this.passwordFocused = false;
    this.passwordTouched = true;
    this.validatePassword();
  }

  shouldShowPasswordTooltip(): boolean {
    const hasPassword = !!this.formData.password?.length;
    return (
      this.passwordFocused ||
      (hasPassword && (!this.passwordValid || !this.passwordTouched))
    );
  }

  validatePassword(): void {
    const pwd = this.formData.password || '';
    this.remainingRules = this.passwordRules
      .filter(rule => !rule.test.test(pwd))
      .map(rule => rule.label);

    this.passwordValid = this.remainingRules.length === 0 && pwd.length > 0;
    this.passwordError = !this.passwordValid && pwd.length >= 8;
  }

  validateForm(): boolean {
    const mobileRegex = /^\d{10}$/;
    const aadhaarRegex = /^\d{12}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.formData.firstName || !this.formData.lastName || !this.formData.mobile ||
      !this.aadharRaw || !this.formData.email || !this.formData.password || !this.formData.state ||
      !this.formData.district || !this.formData.role) {
      this.errorMessage = 'Please fill all mandatory fields.';
      return false;
    }

    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (!mobileRegex.test(this.formData.mobile)) {
      this.errorMessage = 'Mobile number must be exactly 10 digits.';
      return false;
    }

    if (!aadhaarRegex.test(this.aadharRaw)) {
      this.errorMessage = 'Aadhaar number must be exactly 12 digits.';
      return false;
    }

    if (!passwordRegex.test(this.formData.password)) {
      this.errorMessage = 'Password does not meet requirements.';
      return false;
    }

    return true;
  }

  submitForm() {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.hasSubmitted = true;
    this.validatePassword();

    if (this.passwordError || !this.validateForm()) {
      this.errorMessage = 'Please fix the password rules before submitting.';
      this.isSubmitting = false;
      this.submissionInProgress = false;
      return;
    }

    const payload = {
      ...this.formData,
      mobile: `+91${this.formData.mobile}`.trim(),
      aadhaar: this.aadharRaw.trim(),
      email: this.formData.email.trim()
    };

    this.authService.registerUser(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'OTP sent successfully!';
        localStorage.setItem('pendingRegistration', JSON.stringify(payload));
        localStorage.setItem('registrationInProgress', 'true');

        if (isPlatformBrowser(this.platformId)) {
          if (window.history.state === null) {
            history.pushState({ page: 'register' }, '', location.href);
          }
          window.addEventListener('beforeunload', this.confirmUnload);
          window.addEventListener('popstate', this.confirmBack);
        }

        setTimeout(() => {
          this.router.navigate(['/verify-otp'], { queryParams: { fromRegister: true } }).then(success => {
            if (isPlatformBrowser(this.platformId)) {
              console.log('🟢 Navigating to OTP...', success);
            }
          });
        }, 300);
      },
      error: (err) => {
        console.error('❌ Registration error:', err);
        this.errorMessage = err?.error?.message || 'Something went wrong!';
        this.isSubmitting = false;
        this.hasSubmitted = false;
      }
    });
  }
}