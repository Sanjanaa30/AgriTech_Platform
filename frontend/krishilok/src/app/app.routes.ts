import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { OtpComponent } from './pages/otp/otp.component';
import { FarmerDashboardComponent } from './pages/farmer-dashboard/farmer-dashboard.component';
import { FarmerSectionComponent } from './pages/farmer-section/farmer-section.component';
import { FarmerOverviewComponent } from './pages/farmer-overview/farmer-overview.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { BuyerOverviewComponent } from './pages/buyer-overview/buyer-overview.component';
import { BuyerMarketplaceComponent } from './pages/buyer-marketplace/buyer-marketplace.component';
import { BuyerOrdersComponent } from './pages/buyer-orders/buyer-orders.component';
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
  },
  {
    path: 'buyer-dashboard',
    component: BuyerDashboardComponent,
    canActivate: [AuthGuard],
    canDeactivate: [ConfirmExitGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: BuyerOverviewComponent },
      { path: 'marketplace', component: BuyerMarketplaceComponent },
      { path: 'orders', component: BuyerOrdersComponent },
    ]
  }

];
