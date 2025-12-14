import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface RoleInfo {
  roles: string[];
  name: string;
}

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.css']
})
export class RoleSwitcherComponent implements OnInit {
  userRoles: string[] = [];
  availableRoles = ['farmer', 'buyer', 'expert', 'government'];
  showDropdown = false;
  currentRole: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserRoles();
    this.detectCurrentRole();
  }

  detectCurrentRole(): void {
    const url = this.router.url;
    if (url.includes('buyer-dashboard')) {
      this.currentRole = 'buyer';
    } else if (url.includes('dashboard')) {
      this.currentRole = 'farmer';
    }
  }

  loadUserRoles(): void {
    this.http.get<RoleInfo>('http://localhost:5000/api/roles', { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.userRoles = data.roles;
        },
        error: (err) => {
          console.error('Error loading roles:', err);
        }
      });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  switchToRole(role: string): void {
    if (this.userRoles.includes(role)) {
      // User already has this role, just navigate
      this.navigateToRoleDashboard(role);
    } else {
      // User doesn't have this role, ask to add it
      const confirm = window.confirm(`You don't have the ${role} role. Would you like to add it to your account?`);
      if (confirm) {
        this.addRole(role);
      }
    }
    this.showDropdown = false;
  }

  addRole(role: string): void {
    this.http.post('http://localhost:5000/api/roles/add', 
      { newRole: role }, 
      { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          alert(`${role.charAt(0).toUpperCase() + role.slice(1)} role added successfully!`);
          this.userRoles = res.roles;
          this.navigateToRoleDashboard(role);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to add role');
        }
      });
  }

  navigateToRoleDashboard(role: string): void {
    let targetPath = '';
    switch(role.toLowerCase()) {
      case 'buyer':
        targetPath = '/buyer-dashboard/home';
        break;
      case 'farmer':
        targetPath = '/dashboard/home';
        break;
      case 'expert':
        targetPath = '/expert-dashboard';
        break;
      case 'government':
        targetPath = '/govt-dashboard';
        break;
      default:
        targetPath = '/dashboard/home';
    }
    
    // Force navigation and reload
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([targetPath]);
    });
  }

  getRoleIcon(role: string): string {
    const icons: { [key: string]: string } = {
      'farmer': '🌾',
      'buyer': '🛒',
      'expert': '👨‍🏫',
      'government': '🏛️'
    };
    return icons[role] || '👤';
  }

  getRoleLabel(role: string): string {
    return role === 'government' ? 'Govt. Official' : role.charAt(0).toUpperCase() + role.slice(1);
  }
}
