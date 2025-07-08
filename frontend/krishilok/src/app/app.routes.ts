import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { OtpComponent } from './pages/otp/otp.component';
import { FarmerDashboardComponent } from './pages/farmer-dashboard/farmer-dashboard.component';
import { FarmerSectionComponent } from './pages/farmer-section/farmer-section.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-otp',
    component: OtpComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: FarmerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/:section',
    component: FarmerSectionComponent,
    canActivate: [AuthGuard]
  }

];
