import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CanComponentDeactivate } from '../../guards/confirm-exit.guard';
import { AuthService } from '../../services/auth.service'; // ✅ Add this

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
  // logout(): void {
  //   const confirmed = confirm('Are you sure you want to logout?');
  //   if (!confirmed) {
  //     console.log('❌ Logout cancelled by user.');
  //     return;
  //   }

  //   this.authService.logout();
  // }
  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.authService.logout(); // ✅ Goes to login
    } else {
      console.log('❌ Logout cancelled');
    }
  }



  ngOnInit(): void {
    this.authService.checkAuth().subscribe({
      next: (res) => {
        this.username = res.user?.username || 'Farmer';
        this.pageTitle = `Welcome ${this.username}!`;
        console.log('✅ Authenticated user loaded:', this.username);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });



    // Dynamically set page title based on route
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const nextUrl = event.url;
        this.currentUrl = nextUrl;

        if (nextUrl.includes('my-crops')) this.pageTitle = 'My Crops';
        else if (nextUrl.includes('field-images')) this.pageTitle = 'Field Images';
        else if (nextUrl.includes('marketplace')) this.pageTitle = 'Marketplace';
        else if (nextUrl.includes('orders')) this.pageTitle = 'Orders';
        else if (nextUrl.includes('ai-predictions')) this.pageTitle = 'AI Predictions';
        else if (nextUrl.includes('expert-replies')) this.pageTitle = 'Expert Replies';
        else if (nextUrl.includes('govt-announcements')) this.pageTitle = 'Govt Announcements';
        else this.pageTitle = `Welcome ${this.username}!`;
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  canDeactivate(): boolean {
    const confirmExit = window.confirm('Are you sure you want to go back to the login page?');
    if (confirmExit) {
      localStorage.clear(); // Optional
      sessionStorage.clear(); // Optional
    }
    return confirmExit;
  }
}
