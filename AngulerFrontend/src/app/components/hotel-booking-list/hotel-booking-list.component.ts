import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-hotel-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './hotel-booking-list.component.html',
  styleUrls: ['./hotel-booking-list.component.css']
})
export class HotelBookingListComponent implements OnInit {
  bookings: any[] = [];
  displayedColumns: string[] = ['hotelBookingID', 'clientName', 'hotelName', 'checkInDate', 'checkOutDate', 'createdAt', 'fareTotal', 'paymentStatus', 'bookingStatus', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.apiService.getAll<any>('HotelBookings').subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => console.error('Failed to load hotel bookings', err)
    });
  }

  deleteBooking(id: number): void {
    if (confirm('Are you sure you want to delete this hotel booking?')) {
      this.apiService.delete('HotelBookings', id).subscribe({
        next: () => this.loadBookings(),
        error: (err) => console.error('Failed to delete hotel booking', err)
      });
    }
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return 'warn';
      default: return '';
    }
  }
}
