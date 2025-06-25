import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
<select
  #langSelect
  class="bg-yellow-400 text-black font-semibold py-2 px-5 rounded-lg text-sm md:text-base appearance-none cursor-pointer hover:bg-yellow-500 transition-colors duration-300 shadow-md text-center"
  [value]="currentLang"
  (change)="onLanguageChange(langSelect.value)"
>
  <option disabled selected value="">{{ 'SELECT_LANGUAGE' | translate }}</option>
  <option *ngFor="let lang of languages" [value]="lang.code">
    {{ lang.label }}
  </option>
</select>
  `
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: string = '';

  languages = [
    { code: 'en', label: 'English' },
    { code: 'as', label: 'অসমীয়া (Assamese)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'brx', label: 'बोडो (Bodo)' },
    { code: 'doi', label: 'डोगरी (Dogri)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ks', label: 'कॉशुर (Koshur)' },
    { code: 'kok', label: 'कोंकणी (Konkani)' },
    { code: 'mai', label: 'মৈথিলী (Maithili)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'mni', label: 'মৈতৈলোন্ (Meitei)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ne', label: 'नेपाली (Nepali)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'sa', label: 'संस्कृतम् (Samskrit)' },
    { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)' },
    { code: 'sd', label: 'سنڌي‎ (Sindhi)' },
    { code: 'ta', label: 'தமிழ் (Tamiḻ)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ur', label: 'اردو (Urdu)' }
  ];

  constructor(private languageService: LanguageService) { }

  ngOnInit(): void {
    this.currentLang = ''; // nothing selected initially
  }

  onLanguageChange(lang: string): void {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }
}
