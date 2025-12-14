import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CanComponentDeactivate } from '../../guards/confirm-exit.guard';
import { AuthService } from '../../services/auth.service';
import { RoleSwitcherComponent } from '../../components/role-switcher/role-switcher.component';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleSwitcherComponent],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent implements OnInit, CanComponentDeactivate {
  username: string = '';
  pageTitle: string = 'Welcome Buyer!';
  isMobileMenuOpen = false;
  currentUrl: string = '';

  menuItems = [
    {
      name: 'Home',
      path: 'home',
      icon: 'M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v11a1 1 0 001 1h3m-7-11v5'
    },
    {
      name: 'Browse Marketplace',
      path: 'marketplace',
      icon: 'M3 4h18l-1.5 9h-15L3 4zm2 11h14v5a1 1 0 01-1 1H6a1 1 0 01-1-1v-5z'
    },
    {
      name: 'My Orders',
      path: 'orders',
      icon: 'M3 7h18M6 10h12M6 13h12M6 16h12'
    },
    {
      name: 'Wishlist',
      path: 'wishlist',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    {
      name: 'Notifications',
      path: 'notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    }
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
        this.username = res.user?.username || 'Buyer';
        this.setPageTitle(this.router.url);
        console.log('✅ Authenticated buyer loaded:', this.username);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.currentUrl = event.url;
        this.setPageTitle(event.url);
      });
  }

  setPageTitle(url: string): void {
    if (url.includes('marketplace')) {
      this.pageTitle = 'Browse Marketplace';
    } else if (url.includes('orders')) {
      this.pageTitle = 'My Orders';
    } else if (url.includes('wishlist')) {
      this.pageTitle = 'My Wishlist';
    } else if (url.includes('notifications')) {
      this.pageTitle = 'Notifications';
    } else if (
      url === '/buyer-dashboard' ||
      url === '/buyer-dashboard/' ||
      url === '/buyer-dashboard/home'
    ) {
      this.pageTitle = this.username ? `Welcome ${this.username}!` : 'Welcome Buyer!';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  canDeactivate(): boolean {
    // Check if navigating to another dashboard (role switching)
    const nextUrl = this.router.url;
    const isDashboardNavigation = nextUrl.includes('dashboard') || nextUrl.includes('buyer-dashboard');
    
    // If navigating to another dashboard, allow without confirmation
    if (isDashboardNavigation || nextUrl === '/') {
      return true;
    }
    
    // Otherwise, ask for confirmation
    const confirmExit = window.confirm('Are you sure you want to go back to the login page?');
    if (confirmExit) {
      localStorage.clear();
      sessionStorage.clear();
      this.authService.logout();
    }
    return confirmExit;
  }
}
