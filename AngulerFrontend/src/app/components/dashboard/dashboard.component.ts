import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    packages: 0,
    bookings: 0,
    hotels: 0,
    hotelBookings: 0,
    restaurants: 0,
    tourSpots: 0,
    divisions: 0,
    payments: 0,
    customTours: 0
  };

  recentBookings: any[] = [];
  users: any[] = [];
  roles: any[] = [];
  isAdmin = false;
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.isAdmin = localStorage.getItem('role') === 'Admin';

    forkJoin({
      packages:      this.apiService.getAll<any>('Packages'),
      bookings:      this.apiService.getAll<any>('Bookings'),
      hotels:        this.apiService.getAll<any>('Hotels'),
      hotelBookings: this.apiService.getAll<any>('HotelBookings'),
      restaurants:   this.apiService.getAll<any>('Restaurants'),
      tourSpots:     this.apiService.getAll<any>('TourSpots'),
      divisions:     this.apiService.getAll<any>('Divisions'),
      payments:      this.apiService.getAll<any>('Payments'),
      customTours:   this.apiService.getAll<any>('CustomTours')
    }).subscribe({
      next: (res) => {
        this.stats.packages      = res.packages?.length      || 0;
        this.stats.bookings      = res.bookings?.length      || 0;
        this.stats.hotels        = res.hotels?.length        || 0;
        this.stats.hotelBookings = res.hotelBookings?.length || 0;
        this.stats.restaurants   = res.restaurants?.length   || 0;
        this.stats.tourSpots     = res.tourSpots?.length     || 0;
        this.stats.divisions     = res.divisions?.length     || 0;
        this.stats.payments      = res.payments?.length      || 0;
        this.stats.customTours   = res.customTours?.length   || 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    if (this.isAdmin) {
      forkJoin({
        users: this.apiService.getAll<any>('Users'),
        roles: this.apiService.getAll<any>('Roles')
      }).subscribe({
        next: (res) => {
          this.users = res.users;
          this.roles = res.roles;
        }
      });
    }
  }

  updateUserRole(userId: number, roleId: number): void {
    this.apiService.update<any>('Users', `${userId}/role`, { roleId }).subscribe({
      next: () => {
        alert('User role updated successfully');
      },
      error: () => {
        alert('Failed to update user role');
      }
    });
  }

  get userName(): string {
    return localStorage.getItem('userName') || 'Admin';
  }
}
