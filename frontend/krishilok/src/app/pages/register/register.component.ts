import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import stateDistrictData from '../../../assets/states-districts.json';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ✅ Include this import

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  showPassword = false;
  passwordFocused = false;
  passwordTouched = false;
  passwordValid = false;
  passwordError = false;
  remainingRules: string[] = [];

  formData = {
    firstName: '',
    lastName: '',
    mobile: '',
    aadhaar: '',      // ✅ Fix typo: use 'aadhaar'
    email: '',
    password: '',
    role: '',         // ✅ Use 'role' not 'roles'
    state: '',
    district: ''
  };

  states: string[] = [];
  districts: string[] = [];
  aadharRaw: string = ''; // for validation only

  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.states = Object.keys(stateDistrictData);
  }

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

  isValidMobile(): boolean {
    return /^\d{10}$/.test(this.formData.mobile);
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
    const mobileRegex = /^\d{10}$/; // 10 digits
    const aadhaarRegex = /^\d{12}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!this.formData.firstName || !this.formData.lastName || !this.formData.mobile ||
      !this.aadharRaw || !this.formData.password || !this.formData.state ||
      !this.formData.district || !this.formData.role) {
      this.errorMessage = 'Please fill all mandatory fields.';
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
    this.validatePassword();
    if (this.passwordError) {
      this.errorMessage = 'Please fix the password rules before submitting.';
      return;
    }

    if (!this.validateForm()) return;

    // ✅ Add +91 prefix before sending to backend
    const payload = {
      ...this.formData,
      mobile: `+91${this.formData.mobile}`,  // 🔧 Add country code
      aadhaar: this.aadharRaw
    };

    this.authService.registerUser(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Account created!';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Something went wrong!';
      }
    });
  }

}
