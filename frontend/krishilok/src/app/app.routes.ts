import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { OtpComponent } from './pages/otp/otp.component';
import { FarmerDashboardComponent } from './pages/farmer-dashboard/farmer-dashboard.component';
import { FarmerOverviewComponent } from './pages/farmer-overview/farmer-overview.component';
import { FarmerMyCropsComponent } from './pages/farmer-my-crops/farmer-my-crops.component';
import { FarmerFieldImagesComponent } from './pages/farmer-field-images/farmer-field-images.component';
import { FarmerMarketplaceComponent } from './pages/farmer-marketplace/farmer-marketplace.component';
import { FarmerOrdersComponent } from './pages/farmer-orders/farmer-orders.component';
import { FarmerAiPredictionsComponent } from './pages/farmer-ai-predictions/farmer-ai-predictions.component';
import { FarmerExpertRepliesComponent } from './pages/farmer-expert-replies/farmer-expert-replies.component';
import { FarmerGovtAnnouncementsComponent } from './pages/farmer-govt-announcements/farmer-govt-announcements.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { BuyerOverviewComponent } from './pages/buyer-overview/buyer-overview.component';
import { BuyerMarketplaceComponent } from './pages/buyer-marketplace/buyer-marketplace.component';
import { BuyerOrdersComponent } from './pages/buyer-orders/buyer-orders.component';
import { BuyerWishlistComponent } from './pages/buyer-wishlist/buyer-wishlist.component';
import { BuyerNotificationsComponent } from './pages/buyer-notifications/buyer-notifications.component';
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
    canDeactivate: [ConfirmExitGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: FarmerOverviewComponent },
      { path: 'my-crops', component: FarmerMyCropsComponent },
      { path: 'field-images', component: FarmerFieldImagesComponent },
      { path: 'marketplace', component: FarmerMarketplaceComponent },
      { path: 'orders', component: FarmerOrdersComponent },
      { path: 'ai-predictions', component: FarmerAiPredictionsComponent },
      { path: 'expert-replies', component: FarmerExpertRepliesComponent },
      { path: 'govt-announcements', component: FarmerGovtAnnouncementsComponent },
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
      { path: 'wishlist', component: BuyerWishlistComponent },
      { path: 'notifications', component: BuyerNotificationsComponent },
    ]
  }

];
