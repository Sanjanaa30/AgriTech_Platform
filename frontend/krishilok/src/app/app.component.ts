import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule]
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    if (isPlatformBrowser(this.platformId)) {
      this.languageService.getLanguage().subscribe(lang => {
        this.translate.use(lang);
      });
    }
  }

  // ngOnInit(): void {
  //   if (!isPlatformBrowser(this.platformId)) return; // ✅ Prevent SSR crash

  //   // ✅ Safe browser-only logic
  //   window.onbeforeunload = () => true;

  //   const publicRoutes = ['/login', '/register', '/verify-otp', '/'];

  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe((event: NavigationEnd) => {
  //       const currentRoute = event.urlAfterRedirects || event.url;
  //       const isPublic = publicRoutes.some(route => currentRoute.startsWith(route));

  //       if (!isPublic && !this.authService.isAuthenticated()) {
  //         const confirmBack = confirm('You are not authenticated. Go to login page?');
  //         if (confirmBack) {
  //           window.location.replace('/login');
  //         } else {
  //           console.warn('⛔ User cancelled redirect to login');
  //         }
  //       }
  //     });
  // }

  // ngOnInit(): void {
  //   if (!isPlatformBrowser(this.platformId)) return; // 🛡 Prevent SSR crash

  //   const publicRoutes = ['/', '/login', '/register', '/verify-otp'];
  //   const protectedRoutes = ['/dashboard']; // Add more protected prefixes if needed

  //   this.router.events
  //     .pipe(filter(event => event instanceof NavigationEnd))
  //     .subscribe((event: NavigationEnd) => {
  //       const currentRoute = event.urlAfterRedirects || event.url;

  //       // ✅ Ask before leaving if on protected route
  //       if (protectedRoutes.some(route => currentRoute.startsWith(route))) {
  //         window.onbeforeunload = () => 'Are you sure you want to leave this page?';
  //       } else {
  //         window.onbeforeunload = null;
  //       }

  //       // 🔒 Redirect if not authenticated
  //       const isPublic = publicRoutes.some(route => currentRoute.startsWith(route));
  //       if (!isPublic && !this.authService.isAuthenticated()) {
  //         const confirmBack = confirm('You are not authenticated. Go to login page?');
  //         if (confirmBack) {
  //           window.location.replace('/login');
  //         } else {
  //           console.warn('⛔ User cancelled redirect to login');
  //         }
  //       }
  //     });
  // }

  ngOnInit(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  const publicRoutes = ['/', '/login', '/register', '/verify-otp'];
  const protectedRoutes = ['/dashboard']; // Add more if needed

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const currentRoute = event.urlAfterRedirects || event.url;

      const isPublic = publicRoutes.some(route => currentRoute.startsWith(route));
      const isProtected = protectedRoutes.some(route => currentRoute.startsWith(route));

      // ✅ Prompt only on protected route
      window.onbeforeunload = isProtected
        ? () => 'Are you sure you want to leave this page?'
        : null;

      // ✅ If user is unauthenticated, force login
      if (!isPublic && !this.authService.isAuthenticated()) {
        const confirmBack = confirm('You are not authenticated. Go to login page?');
        if (confirmBack) {
          this.router.navigateByUrl('/login', { replaceUrl: true });
        } else {
          console.warn('⛔ User cancelled redirect to login');
        }
      }
    });
}





}


