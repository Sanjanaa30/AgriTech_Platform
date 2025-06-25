import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { RouterModule } from '@angular/router'; // ✅ Add this
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterModule, // ✅ Required for <router-outlet>
    TranslateModule // ✅ Optional, only if you're using translate pipe in app.component.html
  ]
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en'); // Always load English on every visit

    // Optional: reflect any manual change temporarily
    this.languageService.getLanguage().subscribe(lang => {
      this.translate.use(lang);
    });
  }


}
