// otp.component.ts
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
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})

export class OtpComponent implements OnInit, OnDestroy {

  maskedEmail: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  verificationSuccess: boolean = false;
  resendTimer: number = 0;
  showResendMessage: boolean = false;
  otpExpired: boolean = false;

  private expiryTimer: any;
  private resendInterval: any;
  private emailToVerify: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute, // 👈 Added
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const tryLoadData = () => {
        const dataRaw = localStorage.getItem('pendingVerification');
        if (!dataRaw) {
          console.warn('🔁 Retrying to load localStorage...');
          setTimeout(tryLoadData, 100);  // ✅ no return
          return; // ✅ early exit with no value
        }

        console.log('🧾 Local storage value:', dataRaw);
        try {
          const data = JSON.parse(dataRaw);
          const email = data?.email;
          const mobile = data?.mobile;

          if (!email || !mobile) {
            console.warn('⚠️ Missing or invalid email or mobile:', email, mobile);
            this.router.navigate(['/register']);
            return;
          }

          this.emailToVerify = email;
          this.maskedEmail = email;

          this.route.queryParams.subscribe(params => {
            if (params['fromRegister']) {
              setTimeout(() => {
                const firstOtpBox = document.querySelector<HTMLInputElement>('.otp-box');
                firstOtpBox?.focus();
              }, 200);
            }
          });

          // Set timers and handlers
          this.expiryTimer = setTimeout(() => {
            this.otpExpired = true;
          }, 5 * 60 * 1000);

          window.addEventListener('beforeunload', this.blockUnload);
          history.pushState(null, '', location.href);
          window.addEventListener('popstate', this.blockBackNavigation);

          this.initOtpInputHandlers();

        } catch (e) {
          console.error('❌ Failed to parse pendingVerification:', e);
          this.router.navigate(['/register']);
        }
      };

      tryLoadData();
    }
  }


  ngOnDestroy(): void {
    if (this.resendInterval) clearInterval(this.resendInterval);
    if (this.expiryTimer) clearTimeout(this.expiryTimer);

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.blockUnload);
      window.removeEventListener('popstate', this.blockBackNavigation);
    }
  }

  verifyOtp(): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-box');
    const otpCode = Array.from(inputs).map(input => input.value).join('');

    console.log('🔐 OTP entered:', otpCode);

    if (otpCode.length !== 6) {
      console.warn('❌ OTP too short or empty');
      this.showError = true;
      return;
    }

    if (this.otpExpired) {
      this.showError = true;
      this.errorMessage = 'OTP has expired. Please request a new one.';
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      this.showError = true;
      this.errorMessage = 'OTP must be 6 digits only.';
      return;
    }

    this.isLoading = true;

    this.authService.verifyEmailOtp({
      email: this.emailToVerify,
      otp: otpCode
    }).subscribe({
      next: () => {
        console.log('✅ OTP verification successful');
        this.verificationSuccess = true;
        this.showError = false;
        localStorage.removeItem('pendingVerification');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Something went wrong. Please try again.';
        console.error('❌ OTP verification failed:', msg);

        this.errorMessage = msg;

        if (msg.includes('expired') || msg.includes('not found')) {
          this.otpExpired = true;
        }

        this.showError = true;
        this.verificationSuccess = false;
        this.isLoading = false;

        inputs.forEach(input => input.value = '');
        inputs[0]?.focus();
      }
    });
  }

  resendCode(): void {
    if (this.resendTimer > 0) return;

    this.resendTimer = 30;
    this.showResendMessage = false;

    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer === 0) clearInterval(this.resendInterval);
    }, 1000);

    this.authService.resendOtp(this.emailToVerify).subscribe({
      next: () => {
        this.showResendMessage = true;
        setTimeout(() => this.showResendMessage = false, 3000);
      },
      error: () => {
        console.error('❌ Failed to resend OTP.');
      }
    });
  }


  private initOtpInputHandlers(): void {
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
        if (index > 0) inputs[index - 1].focus();
      }

      if (!/^\d$/.test(event.key) && event.key !== 'Backspace') {
        event.preventDefault();
      }
    };
  }

  blockUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };

  blockBackNavigation = () => {
    alert('⚠️ Please complete verification before leaving this page.');
    history.pushState(null, '', location.href);
  };
}