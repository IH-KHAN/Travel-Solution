import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GeographyListComponent } from './components/geography-list/geography-list.component';
import { GeographyFormComponent } from './components/geography-form/geography-form.component';
import { TourPackageListComponent } from './components/tour-package-list/tour-package-list.component';
import { TourPackageFormComponent } from './components/tour-package-form/tour-package-form.component';
import { AdminPackageTrackingComponent } from './components/admin-package-tracking/admin-package-tracking.component';
import { CompletedToursComponent } from './components/completed-tours/completed-tours.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'geographies', component: GeographyListComponent, canActivate: [AuthGuard] },
  { path: 'geographies/new', component: GeographyFormComponent, canActivate: [AuthGuard] },
  { path: 'geographies/edit/:id', component: GeographyFormComponent, canActivate: [AuthGuard] },
  { path: 'packages', component: TourPackageListComponent, canActivate: [AuthGuard] },
  { path: 'packages/new', component: TourPackageFormComponent, canActivate: [AuthGuard] },
  { path: 'packages/edit/:id', component: TourPackageFormComponent, canActivate: [AuthGuard] },
  { path: 'packages/track/:id', component: AdminPackageTrackingComponent, canActivate: [AuthGuard] },
  { path: 'packages/completed', component: CompletedToursComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
