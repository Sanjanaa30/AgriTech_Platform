import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CanComponentDeactivate } from '../../guards/confirm-exit.guard';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.css']
})
export class FarmerDashboardComponent implements OnInit, CanComponentDeactivate {
  username: string = '';
  pageTitle: string = 'Welcome Farmer!';
  isMobileMenuOpen = false;
  currentUrl: string = '';

  menuItems = [
    { name: 'My Crops', path: 'my-crops', icon: '🌾' },
    { name: 'Field Images', path: 'field-images', icon: '📷' },
    { name: 'Marketplace', path: 'marketplace', icon: '🛒' },
    { name: 'Orders', path: 'orders', icon: '📦' },
    { name: 'AI Predictions', path: 'ai-predictions', icon: '🤖' },
    { name: 'Expert Replies', path: 'expert-replies', icon: '👨‍🏫' },
    { name: 'Govt Announcements', path: 'govt-announcements', icon: '📢' }
  ];

  constructor(private router: Router, private authService: AuthService) { }

  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.authService.logout();
    } else {
      console.log('❌ Logout cancelled');
    }
  }

  ngOnInit(): void {
    this.authService.checkAuth().subscribe({
      next: (res) => {
        this.username = res.user?.username || 'Farmer';

        // 👇 Trigger pageTitle again once username is set
        this.setPageTitle(this.router.url);
        console.log('✅ Authenticated user loaded:', this.username);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const nextUrl = event.url;
        this.currentUrl = nextUrl;

        // 👇 Defer welcome title until we have username
        if (this.username) {
          this.setPageTitle(nextUrl);
        }
      });
  }


  setPageTitle(url: string): void {
    if (url.includes('my-crops')) this.pageTitle = 'My Crops';
    else if (url.includes('field-images')) this.pageTitle = 'Field Images';
    else if (url.includes('marketplace')) this.pageTitle = 'Marketplace';
    else if (url.includes('orders')) this.pageTitle = 'Orders';
    else if (url.includes('ai-predictions')) this.pageTitle = 'AI Predictions';
    else if (url.includes('expert-replies')) this.pageTitle = 'Expert Replies';
    else if (url.includes('govt-announcements')) this.pageTitle = 'Govt Announcements';
    else if (url === '/dashboard' || url === '/dashboard/') {
      this.pageTitle = this.username ? `Welcome ${this.username}!` : 'Welcome Farmer!';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  canDeactivate(): boolean {
    const confirmExit = window.confirm('Are you sure you want to go back to the login page?');
    if (confirmExit) {
      localStorage.clear();
      sessionStorage.clear();
      this.authService.logout(); // ✅ Force cookie cleanup + logout
    }
    return confirmExit;
  }
}