import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotel-booking-detail',
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
  templateUrl: './hotel-booking-detail.component.html',
  styleUrls: ['./hotel-booking-detail.component.css']
})
export class HotelBookingDetailComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingId: number | null = null;
  bookingDetails: any = null;
  isViewOnly = false;
  
  statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  availableRooms: any[] = [];

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
      hotelBookingID: [0],
      clientID: [0],
      hotelID: [0],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      fareTotal: [0, Validators.min(0)],
      bookingStatus: ['Pending'],
      rooms: this.fb.array([])
    });

    // Recalculate total when dates change
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.calculateTotal());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  get rooms(): FormArray {
    return this.bookingForm.get('rooms') as FormArray;
  }

  loadBooking(id: number): void {
    this.apiService.getById<any>('HotelBookings', id).subscribe({
      next: (data) => {
        this.bookingDetails = data;
        this.bookingForm.patchValue({
          hotelBookingID: data.hotelBookingID,
          clientID: data.clientID,
          hotelID: data.hotelID,
          checkInDate: data.checkInDate ? data.checkInDate.substring(0, 10) : '',
          checkOutDate: data.checkOutDate ? data.checkOutDate.substring(0, 10) : '',
          fareTotal: data.fareTotal,
          bookingStatus: data.bookingStatus || 'Pending'
        });

        // Load rooms for this hotel to populate dropdown
        if (data.hotelID) {
          this.loadHotelRooms(data.hotelID);
        }

        // Clear existing FormArray
        while (this.rooms.length !== 0) {
          this.rooms.removeAt(0);
        }

        // Add rooms from data
        if (data.rooms && data.rooms.length > 0) {
          data.rooms.forEach((room: any) => this.addRoom(room));
        }
      },
      error: (err) => console.error('Failed to load hotel booking', err)
    });
  }

  loadHotelRooms(hotelId: number): void {
    this.apiService.getById<any>('Hotels/MasterDetail', hotelId).subscribe({
      next: (data) => {
        if (data && data.rooms) {
          this.availableRooms = data.rooms;
        }
      },
      error: (err) => console.error('Failed to load hotel rooms', err)
    });
  }

  addRoom(roomData: any = null): void {
    const roomGroup = this.fb.group({
      roomId: [roomData ? roomData.roomId : null, Validators.required],
      quantity: [roomData ? roomData.quantity : 1, [Validators.required, Validators.min(1)]],
      unitPrice: [roomData ? roomData.unitPrice : 0, [Validators.required, Validators.min(0)]]
    });

    // Auto-update price when room changes
    roomGroup.get('roomId')?.valueChanges.subscribe(rId => {
      if (rId) {
        const selectedRoom = this.availableRooms.find(r => r.roomId === rId);
        if (selectedRoom) {
          roomGroup.get('unitPrice')?.setValue(selectedRoom.pricePerNight);
          this.calculateTotal();
        }
      }
    });

    roomGroup.get('quantity')?.valueChanges.subscribe(() => this.calculateTotal());
    roomGroup.get('unitPrice')?.valueChanges.subscribe(() => this.calculateTotal());

    this.rooms.push(roomGroup);
    // Don't call calculateTotal immediately since the form might still be patching. 
    // Wait for the next tick or rely on the form changes.
    setTimeout(() => this.calculateTotal(), 0);
  }

  removeRoom(index: number): void {
    this.rooms.removeAt(index);
    this.calculateTotal();
  }

  calculateTotal(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    let nights = 1;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        nights = diffDays;
      }
    }

    let total = 0;
    for (let i = 0; i < this.rooms.length; i++) {
      const row = this.rooms.at(i).value;
      total += (row.quantity || 0) * (row.unitPrice || 0);
    }
    
    this.bookingForm.patchValue({ fareTotal: total * nights }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.bookingId) {
      const formValue = this.bookingForm.value;
      // Convert rooms array to match DTO if needed
      this.apiService.update('Bookings/HotelBookings/MasterDetail', this.bookingId, formValue).subscribe({
        next: () => this.router.navigate(['/hotel-bookings']),
        error: (err) => {
          // If the nested routing is slightly different, fallback to the direct one:
          this.apiService.update('HotelBookings/MasterDetail', this.bookingId!, formValue).subscribe({
            next: () => this.router.navigate(['/hotel-bookings']),
            error: (err2) => console.error('Failed to update hotel booking', err2)
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/hotel-bookings']);
  }
}
