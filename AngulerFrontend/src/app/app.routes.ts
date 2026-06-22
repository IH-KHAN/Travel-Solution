import { Routes } from '@angular/router';
import { AdminRefundListComponent } from './components/admin-refund-list/admin-refund-list.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GeographyFormComponent } from './components/geography-form/geography-form.component';
import { DistrictFormComponent } from './components/district-form/district-form.component';
import { LocationFormComponent } from './components/location-form/location-form.component';
import { TourSpotDashboardComponent } from './components/tour-spot-dashboard/tour-spot-dashboard.component';
import { TourSpotFormComponent } from './components/tour-spot-form/tour-spot-form.component';
import { TourPackageListComponent } from './components/tour-package-list/tour-package-list.component';
import { TourPackageFormComponent } from './components/tour-package-form/tour-package-form.component';
import { AdminPackageTrackingComponent } from './components/admin-package-tracking/admin-package-tracking.component';
import { CompletedToursComponent } from './components/completed-tours/completed-tours.component';
import { HotelListComponent } from './components/hotel-list/hotel-list.component';
import { HotelFormComponent } from './components/hotel-form/hotel-form.component';
import { RestaurantListComponent } from './components/restaurant-list/restaurant-list.component';
import { RestaurantFormComponent } from './components/restaurant-form/restaurant-form.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AuthGuard } from './guards/auth.guard';

import { AgentDashboardComponent } from './components/agent-dashboard/agent-dashboard.component';
import { AgentPackageExecutionComponent } from './components/agent-package-execution/agent-package-execution.component';
import { MyMagazinesComponent } from './components/my-magazines/my-magazines.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Geographies (Divisions) — base redirects to the unified dashboard
  { path: 'geographies', redirectTo: '/tourspots', pathMatch: 'full' },
  { path: 'geographies/new', component: GeographyFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'geographies/edit/:id', component: GeographyFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Districts — base redirects to the unified dashboard
  { path: 'districts', redirectTo: '/tourspots', pathMatch: 'full' },
  { path: 'districts/new', component: DistrictFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'districts/edit/:id', component: DistrictFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Locations — base redirects to the unified dashboard
  { path: 'locations', redirectTo: '/tourspots', pathMatch: 'full' },
  { path: 'locations/new', component: LocationFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'locations/edit/:id', component: LocationFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Tour Spots Dashboard
  { path: 'tourspots', component: TourSpotDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'tourspots/new', component: TourSpotFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'tourspots/edit/:id', component: TourSpotFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Tour Packages
  { path: 'packages', component: TourPackageListComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'packages/new', component: TourPackageFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'packages/edit/:id', component: TourPackageFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'packages/track/:id', component: AdminPackageTrackingComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'packages/completed', component: CompletedToursComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Hotels
  { path: 'hotels', component: HotelListComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'hotels/new', component: HotelFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'hotels/edit/:id', component: HotelFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Restaurants
  { path: 'restaurants', component: RestaurantListComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'restaurants/add', component: RestaurantFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'restaurants/edit/:id', component: RestaurantFormComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Bookings
  { path: 'tour-bookings', loadComponent: () => import('./components/tour-booking-list/tour-booking-list.component').then(m => m.TourBookingListComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'tour-bookings/edit/:id', loadComponent: () => import('./components/tour-booking-detail/tour-booking-detail.component').then(m => m.TourBookingDetailComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'hotel-bookings', loadComponent: () => import('./components/hotel-booking-list/hotel-booking-list.component').then(m => m.HotelBookingListComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'hotel-bookings/edit/:id', loadComponent: () => import('./components/hotel-booking-detail/hotel-booking-detail.component').then(m => m.HotelBookingDetailComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Custom Tours
  { path: 'custom-tours', loadComponent: () => import('./components/custom-tour-list/custom-tour-list.component').then(m => m.CustomTourListComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'custom-tours/edit/:id', loadComponent: () => import('./components/custom-tour-detail/custom-tour-detail.component').then(m => m.CustomTourDetailComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Refunds
  { path: 'refunds', component: AdminRefundListComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Reviews
  { path: 'reviews', loadComponent: () => import('./components/admin-review-list/admin-review-list.component').then(m => m.AdminReviewListComponent), canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },

  // Admin
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Audit'] } },
  { path: 'admin/audit-logs', loadComponent: () => import('./components/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent), canActivate: [AuthGuard], data: { roles: ['Audit'] } },

  // Agent
  { path: 'agent/dashboard', component: AgentDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Agent', 'Admin', 'Audit'] } },
  { path: 'agent/package/:id', component: AgentPackageExecutionComponent, canActivate: [AuthGuard], data: { roles: ['Agent', 'Admin', 'Audit'] } },

  // Client
  { path: 'my-magazines', component: MyMagazinesComponent, canActivate: [AuthGuard] }
];
