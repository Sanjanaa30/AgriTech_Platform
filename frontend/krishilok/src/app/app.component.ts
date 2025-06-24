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
    const lang = this.languageService.getCurrentLanguage();
    this.translate.setDefaultLang(lang);
    this.translate.use(lang); // 👈 apply language

    // Optional: sync when changed later
    this.languageService.getLanguage().subscribe((newLang) => {
      this.translate.use(newLang);
    });
  }
}
