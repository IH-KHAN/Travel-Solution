import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RefundService } from '../../services/refund.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tour-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatExpansionModule, MatTooltipModule, FormsModule],
  templateUrl: './tour-booking-list.component.html',
  styleUrls: ['./tour-booking-list.component.css']
})
export class TourBookingListComponent implements OnInit {
  bookings: any[] = [];
  groupedBookings: { packageTitle: string, packageId: number, bookings: any[] }[] = [];
  displayedColumns: string[] = ['bookingId', 'clientName', 'amount', 'createdAt', 'status', 'paymentStatus', 'actions'];

  // Map of packageId -> whether tour has started (any activity completed)
  tourStartedMap: { [packageId: number]: boolean } = {};

  // Refund modal state
  refundBooking: any = null;
  refundReason: string = '';
  refundAmount: number = 0;
  refundSubmitting: boolean = false;
  refundError: string = '';
  refundSuccess: string = '';

  constructor(private apiService: ApiService, private refundService: RefundService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.apiService.getAll<any>('Bookings').subscribe({
      next: (data) => {
        this.bookings = data;
        this.groupBookingsByPackage();
        this.checkTourStartedForPackages();
      },
      error: (err) => console.error('Failed to load bookings', err)
    });
  }

  groupBookingsByPackage(): void {
    const grouped = this.bookings.reduce((acc, booking) => {
      const key = booking.packageTitle || 'Unassigned Package';
      if (!acc[key]) {
        acc[key] = {
          packageTitle: key,
          packageId: booking.packageId,
          bookings: []
        };
      }
      acc[key].bookings.push(booking);
      return acc;
    }, {});
    
    this.groupedBookings = Object.values(grouped);
  }

  /** Check if any activity has been completed for each distinct package */
  checkTourStartedForPackages(): void {
    const packageIds = [...new Set(this.bookings.map(b => b.packageId).filter(id => id > 0))];
    packageIds.forEach(pkgId => {
      this.apiService.getAll<any>(`Activities/Package/${pkgId}`).subscribe({
        next: (activities: any[]) => {
          this.tourStartedMap[pkgId] = activities.some(a => a.isCompleted === true);
        },
        error: () => {
          // If endpoint fails (e.g. not found), assume not started
          this.tourStartedMap[pkgId] = false;
        }
      });
    });
  }

  isTourStarted(packageId: number): boolean {
    return this.tourStartedMap[packageId] === true;
  }

  deleteBooking(id: number): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.apiService.delete('Bookings', id).subscribe({
        next: () => this.loadBookings(),
        error: (err) => console.error('Failed to delete booking', err)
      });
    }
  }

  getStatusColor(status: string): string {
    switch(status?.toLowerCase()) {
      case 'approved': return 'primary';
      case 'completed': return 'accent';
      case 'cancelled': return 'warn';
      case 'pending': return '';
      default: return '';
    }
  }

  openRefundModal(booking: any): void {
    this.refundBooking = booking;
    this.refundReason = '';
    this.refundAmount = booking.amount || 0;
    this.refundError = '';
    this.refundSuccess = '';
  }

  closeRefundModal(): void {
    this.refundBooking = null;
    this.refundError = '';
    this.refundSuccess = '';
  }

  submitRefund(): void {
    if (!this.refundBooking) return;
    this.refundSubmitting = true;
    this.refundError = '';
    this.refundSuccess = '';

    const payload = {
      bookingId: this.refundBooking.bookingId,
      bookingType: 'TourPackage',
      refundAmount: this.refundAmount,
      reason: this.refundReason,
      status: 'Pending'
    };

    this.refundService.createRefund(payload).subscribe({
      next: () => {
        this.refundSubmitting = false;
        this.refundSuccess = 'Refund request submitted successfully. An admin will review it shortly.';
      },
      error: (err) => {
        this.refundSubmitting = false;
        this.refundError = err?.error || 'Failed to submit refund request.';
      }
    });
  }
}
