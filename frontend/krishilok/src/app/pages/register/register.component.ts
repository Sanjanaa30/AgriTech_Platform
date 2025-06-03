import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import stateDistrictData from '../../../assets/states-districts.json';

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
    aadhar: '',
    email: '',
    password: '',
    role: '',
    district: '',
    state: ''
  };

  // Allow only digits (0–9) on keypress
  allowOnlyDigits(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // Handle mobile input and ensure max 10 digits
  onMobileInput(event: any): void {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
    this.formData.mobile = digitsOnly;
  }

  // Optional: Validate mobile number on submit or blur
  isValidMobile(): boolean {
    return /^\d{10}$/.test(this.formData.mobile);
  }


  aadharRaw: string = ''; // only digits

  onAadharInput(event: any): void {
    const input = event.target.value.replace(/\D/g, ''); // remove non-digits
    this.aadharRaw = input.slice(0, 12); // max 12 digits

    // Update the formData with formatted Aadhaar
    this.formData.aadhar = this.formatAadhar(this.aadharRaw);
  }

  formatAadhar(value: string): string {
    // Format into 1234-5678-9012
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    return parts.join('-');
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  }

  isValidAadhar(): boolean {
    return /^\d{12}$/.test(this.aadharRaw);
  }


  states: string[] = [];
  districts: string[] = [];

  ngOnInit() {
    this.states = Object.keys(stateDistrictData);
  }

  onStateChange(state: string) {
    this.formData.district = '';
    this.districts = (stateDistrictData as any)[state] || [];
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

  validatePassword(): void {
    const pwd = this.formData.password || '';
    this.remainingRules = this.passwordRules
      .filter(rule => !rule.test.test(pwd))
      .map(rule => rule.label);

    this.passwordValid = this.remainingRules.length === 0 && pwd.length > 0;
    this.passwordError = !this.passwordValid && pwd.length >= 8;
  }

  onSubmit() {
    this.validatePassword();
    if (this.passwordError) {
      alert('Please fix the password rules before submitting.');
      return;
    }
    console.log('Form submitted:', this.formData);
  }
}
