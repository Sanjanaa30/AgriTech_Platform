import { Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private defaultLang = 'en';

  private languageSubject = new BehaviorSubject<string>(
    this.isBrowser ? localStorage.getItem('language') || this.defaultLang : this.defaultLang
  );

  setLanguage(lang: string) {
    if (this.isBrowser) {
      localStorage.setItem('language', lang);
    }
    this.languageSubject.next(lang);
  }

  getLanguage() {
    return this.languageSubject.asObservable();
  }

  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }
}