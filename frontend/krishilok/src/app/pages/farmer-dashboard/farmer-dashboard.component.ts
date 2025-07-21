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
    {
      name: 'Home',
      path: 'home',
      icon: 'M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v11a1 1 0 001 1h3m-7-11v5' // Home
    },
    {
      name: 'My Crops',
      path: 'my-crops',
      icon: 'M12 2a10 10 0 00-7.74 16.87l-1.42 1.42a1 1 0 101.42 1.42l1.42-1.42A10 10 0 1012 2z' // Crop-like (circle with leaves)
    },
    {
      name: 'Field Images',
      path: 'field-images',
      icon: 'M4 16l4-4 4 4 4-4 4 4M4 8l4-4 4 4 4-4 4 4' // Image / stacked landscape
    },
    {
      name: 'Marketplace',
      path: 'marketplace',
      icon: 'M3 4h18l-1.5 9h-15L3 4zm2 11h14v5a1 1 0 01-1 1H6a1 1 0 01-1-1v-5z' // Shop
    },
    {
      name: 'Orders',
      path: 'orders',
      icon: 'M3 7h18M6 10h12M6 13h12M6 16h12' // Receipt / list
    },
    {
      name: 'AI Predictions',
      path: 'ai-predictions',
      icon: 'M13 16h-1v-4h-1m2 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z' // AI alert/info
    },
    {
      name: 'Expert Replies',
      path: 'expert-replies',
      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m9 5l9-5' // Message / knowledge
    },
    {
      name: 'Govt Announcements',
      path: 'govt-announcements',
      icon: 'M13 16h-1v-4h-1m2 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' // Info circle
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
    // Load user details and update page title on initial load
    this.authService.checkAuth().subscribe({
      next: (res) => {
        this.username = res.user?.username || 'Farmer';
        this.setPageTitle(this.router.url); // ✅ Only after username is known
        console.log('✅ Authenticated user loaded:', this.username);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });

    // Detect navigation changes within dashboard
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        this.currentUrl = event.url;
        this.setPageTitle(event.url);
      });
  }


  setPageTitle(url: string): void {
    if (url.includes('my-crops')) {
      this.pageTitle = 'My Crops';
    } else if (url.includes('field-images')) {
      this.pageTitle = 'Field Images';
    } else if (url.includes('marketplace')) {
      this.pageTitle = 'Marketplace';
    } else if (url.includes('orders')) {
      this.pageTitle = 'Orders';
    } else if (url.includes('ai-predictions')) {
      this.pageTitle = 'AI Predictions';
    } else if (url.includes('expert-replies')) {
      this.pageTitle = 'Expert Replies';
    } else if (url.includes('govt-announcements')) {
      this.pageTitle = 'Govt Announcements';
    } else if (
      url === '/dashboard' ||
      url === '/dashboard/' ||
      url === '/dashboard/home'
    ) {
      this.pageTitle = this.username ? `Welcome ${this.username}!` : 'Welcome Farmer!';
    } else {
      this.pageTitle = 'Dashboard'; // fallback
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