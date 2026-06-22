import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-tour-booking-detail',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './tour-booking-detail.component.html',
  styleUrls: ['./tour-booking-detail.component.css']
})
export class TourBookingDetailComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingId: number | null = null;
  bookingDetails: any = null;
  isViewOnly = false;
  
  statusOptions = ['Pending', 'Approved', 'Completed', 'Cancelled'];
  paymentStatusOptions = ['Unpaid', 'Partial', 'Paid'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookingId = +id;
        this.loadBooking(this.bookingId);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      this.isViewOnly = params.get('viewOnly') === 'true';
    });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      bookingId: [0],
      userId: [0],
      packageId: [0],
      amount: [0, Validators.min(0)],
      status: ['Pending'],
      paymentStatus: ['Unpaid']
    });
  }

  loadBooking(id: number): void {
    this.apiService.getById<any>('Bookings', id).subscribe({
      next: (data) => {
        this.bookingDetails = data;
        this.bookingForm.patchValue({
          bookingId: data.bookingId,
          userId: data.userId,
          packageId: data.packageId,
          amount: data.amount,
          status: data.status || 'Pending',
          paymentStatus: data.paymentStatus || 'Unpaid'
        });
      },
      error: (err) => console.error('Failed to load booking', err)
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.bookingId) {
      const formValue = this.bookingForm.value;
      this.apiService.update('Bookings', this.bookingId, formValue).subscribe({
        next: () => this.router.navigate(['/tour-bookings']),
        error: (err) => console.error('Failed to update booking', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tour-bookings']);
  }
}
