import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GeographyListComponent } from './components/geography-list/geography-list.component';
import { GeographyFormComponent } from './components/geography-form/geography-form.component';
import { TourPackageListComponent } from './components/tour-package-list/tour-package-list.component';
import { TourPackageFormComponent } from './components/tour-package-form/tour-package-form.component';
import { ActivityModalComponent } from './components/activity-modal/activity-modal.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { PackageDetailModalComponent } from './components/package-detail-modal/package-detail-modal.component';
import { CustomTourListComponent } from './components/custom-tour-list/custom-tour-list.component';
import { CustomTourDetailComponent } from './components/custom-tour-detail/custom-tour-detail.component';
import { AdminPackageTrackingComponent } from './components/admin-package-tracking/admin-package-tracking.component';
import { CompletedToursComponent } from './components/completed-tours/completed-tours.component';
import { CompletedTourDetailModalComponent } from './components/completed-tour-detail-modal/completed-tour-detail-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    DashboardComponent,
    GeographyListComponent,
    GeographyFormComponent,
    TourPackageListComponent,
    TourPackageFormComponent,
    ActivityModalComponent,
    UserManagementComponent,
    PackageDetailModalComponent,
    CustomTourListComponent,
    CustomTourDetailComponent,
    AdminPackageTrackingComponent,
    CompletedToursComponent,
    CompletedTourDetailModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
