import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private languageSubject = new BehaviorSubject<string>('en'); // always default to English

  setLanguage(lang: string) {
    this.languageSubject.next(lang); // no persistence
  }

  getLanguage() {
    return this.languageSubject.asObservable();
  }

  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }
}
