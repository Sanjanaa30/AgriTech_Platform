import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [TranslateModule, RouterModule, LanguageSelectorComponent],
  templateUrl: './landing.component.html',
  // styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  switchLang(event: Event) {
    const selectedLang = (event.target as HTMLSelectElement).value;
    this.translate.use(selectedLang);
  }
}
