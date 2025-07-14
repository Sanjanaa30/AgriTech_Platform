import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

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
    private router: Router
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    this.languageService.getLanguage().subscribe(lang => {
      this.translate.use(lang);
    });
  }

  ngOnInit(): void {
    const publicRoutes = ['/login', '/register', '/verify-otp', '/'];

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentRoute = event.urlAfterRedirects || event.url;
        const isPublic = publicRoutes.some(route => currentRoute.startsWith(route));
        if (!isPublic) {
          this.authService.restoreAuthState();
        }
      });
  }
}
