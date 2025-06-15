import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit, OnDestroy {

  maskedEmail: string = 'john.doe@example.com';
  showError: boolean = false;
  isLoading: boolean = false;
  verificationSuccess: boolean = false;
  resendTimer: number = 0;
  private resendInterval: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('pendingVerification');
      if (data) {
        const { email, mobile } = JSON.parse(data);
        this.maskedEmail = email || mobile;
        console.log('OTP screen loaded with:', email, mobile);
      } else {
        console.warn('No pending verification found. Redirecting...');
        this.router.navigate(['/register']);
      }

      // ✅ JS logic for input handling
      (window as any).handleInput = (event: Event, index: number) => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.otp-box');
        const input = event.target as HTMLInputElement;
        const value = input.value.replace(/\D/g, '');

        if (value) {
          input.value = value.charAt(0);
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        } else {
          input.value = '';
        }
      };

      (window as any).handleKeyDown = (event: KeyboardEvent, index: number) => {
        const inputs = document.querySelectorAll<HTMLInputElement>('.otp-box');
        const input = event.target as HTMLInputElement;

        if (event.key === 'Backspace') {
          input.value = '';
          if (index > 0) {
            inputs[index - 1].focus();
          }
        }

        if (!/^\d$/.test(event.key) && event.key !== 'Backspace') {
          event.preventDefault();
        }
      };

      // ✅ Prevent reload or back
      window.addEventListener('beforeunload', this.blockUnload);
      history.pushState(null, '', location.href);
      window.addEventListener('popstate', this.blockBackNavigation);
    }
  }

  ngOnDestroy(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.blockUnload);
      window.removeEventListener('popstate', this.blockBackNavigation);
    }
  }


  // ✅ Called on Verify button
  verifyOtp(): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-box');
    const otpCode = Array.from(inputs).map(input => input.value).join('');

    if (otpCode.length !== 6) {
      console.warn('Incomplete OTP');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      if (otpCode === '123456') {
        this.verificationSuccess = true;
        console.log('OTP verified successfully!');
      } else {
        this.showError = true;
        this.verificationSuccess = false;
        inputs.forEach(input => input.value = '');
        inputs[0]?.focus();
      }
    }, 2000);
  }

  resendCode(): void {
    if (this.resendTimer > 0) return;

    this.resendTimer = 30;
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer === 0) {
        clearInterval(this.resendInterval);
      }
    }, 1000);

    console.log('New OTP code sent!');
  }

  // ✅ Prevent browser reload
  blockUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };

  // ✅ Prevent back button
  blockBackNavigation = () => {
    alert('⚠️ Please complete verification before leaving this page.');
    history.pushState(null, '', location.href);
  };
}
