import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { OtpComponent } from './pages/otp/otp.component';
import { FarmerDashboardComponent } from './pages/farmer-dashboard/farmer-dashboard.component';
import { FarmerSectionComponent } from './pages/farmer-section/farmer-section.component';
import { FarmerOverviewComponent } from './pages/farmer-overview/farmer-overview.component';
// import { FieldImagesComponent } from './pages/field-images/field-images.component';
// import { MarketplaceComponent } from './pages/marketplace/marketplace.component';
import { AuthGuard } from './guards/auth.guard';
import { ConfirmExitGuard } from './guards/confirm-exit.guard';

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
    canActivate: [AuthGuard],
    canDeactivate: [ConfirmExitGuard], // ✅ Add this line
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // 👈 redirect base
      { path: 'home', component: FarmerOverviewComponent }, // 👈 explicit Home
      { path: ':section', component: FarmerSectionComponent },
      // { path: 'field-images', component: FieldImagesComponent },
      // { path: 'marketplace', component: MarketplaceComponent },
      // etc...
    ]
  }

];
