import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterModule
  ]
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
    if (!publicRoutes.includes(this.router.url)) {
      this.authService.restoreAuthState();
    }
  }
}
