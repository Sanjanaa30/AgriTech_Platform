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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.onbeforeunload = () => true;
    }

    const publicRoutes = ['/login', '/register', '/verify-otp', '/'];

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentRoute = event.urlAfterRedirects || event.url;
        const isPublic = publicRoutes.some(route => currentRoute.startsWith(route));

        if (!isPublic && !this.authService.isAuthenticated()) {
          console.log('⛔ Block navigation to protected route — Not authenticated. Redirecting to login.');
          this.router.navigate(['/login']);
          return;
        }
      });
  }
}
