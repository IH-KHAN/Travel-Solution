import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoomModalComponent } from '../room-modal/room-modal.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDividerModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './hotel-form.component.html',
  styleUrls: ['./hotel-form.component.css']
})
export class HotelFormComponent implements OnInit {
  hotelForm!: FormGroup;
  isEditMode = false;
  hotelId: number | null = null;
  rooms: any[] = []; // Store rooms locally until form is saved
  hotelImages: any[] = []; // Store selected pictures

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.hotelId = +id;
        this.loadHotelData(this.hotelId);
      }
    });
  }

  initForm(): void {
    this.hotelForm = this.fb.group({
      hotelId: [0],
      hotelName: ['', Validators.required],
      accommodationType: ['', Validators.required],
      starRating: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      userRating: [0],
      cityArea: [''],
      neighborhood: [''],
      address: [''],
      description: [''],
      policy: [''],
      hotelEmail: ['', Validators.email],
      isActive: [true],
      createdAt: [new Date().toISOString()],
      isCoupleFriendly: [false],
      amenities: [''],
      discountPercent: [0],
      extraDiscountText: [''],
      hasGetPoints: [false]
    });
  }

  loadHotelData(id: number): void {
    this.apiService.getById<any>('Hotels/MasterDetail', id).subscribe({
      next: (data) => {
        this.hotelForm.patchValue({
          hotelId: data.hotelId,
          hotelName: data.hotelName,
          accommodationType: data.accommodationType,
          starRating: data.starRating,
          userRating: data.userRating,
          cityArea: data.cityArea,
          neighborhood: data.neighborhood,
          address: data.address,
          description: data.description,
          policy: data.policy,
          hotelEmail: data.hotelEmail,
          isActive: data.isActive,
          createdAt: data.createdAt,
          isCoupleFriendly: data.isCoupleFriendly,
          amenities: data.amenities,
          discountPercent: data.discountPercent,
          extraDiscountText: data.extraDiscountText,
          hasGetPoints: data.hasGetPoints
        });
        
        if (data.rooms) {
          this.rooms = [...data.rooms];
        }
        
        if (data.hotelImages) {
          this.hotelImages = [...data.hotelImages];
        }
      },
      error: (err) => console.error(err)
    });
  }

  openRoomModal(): void {
    const dialogRef = this.dialog.open(RoomModalComponent, {
      width: '700px',
      disableClose: true,
      data: { rooms: [...this.rooms] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rooms = result;
        this.hotelForm.markAsDirty();
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        this.apiService.create('Uploads/Temp', formData).subscribe({
          next: (res: any) => {
            if (res && res.url) {
              this.hotelImages.push({ hotelImagesId: 0, hotelImageUrl: res.url, imageCaption: '' });
              this.hotelForm.markAsDirty();
            }
          },
          error: (err) => console.error('Upload failed', err)
        });
      }
      // Reset input
      event.target.value = '';
    }
  }

  removePicture(index: number): void {
    this.hotelImages.splice(index, 1);
    this.hotelForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.hotelForm.valid) {
      const rawValues = this.hotelForm.getRawValue();
      
      const formData = {
        ...rawValues,
        rooms: this.rooms,
        hotelImages: this.hotelImages
      };
      
      if (this.isEditMode && this.hotelId) {
        this.apiService.update('Hotels/MasterDetail', this.hotelId, formData).subscribe({
          next: () => this.router.navigate(['/hotels']),
          error: (err) => {
            console.error('Update Error:', err);
            if (err.error && err.error.errors) {
              alert('Validation Error: ' + JSON.stringify(err.error.errors, null, 2));
            } else {
              alert('An error occurred. Check the console.');
            }
          }
        });
      } else {
        this.apiService.create('Hotels/MasterDetail', formData).subscribe({
          next: () => this.router.navigate(['/hotels']),
          error: (err) => {
            console.error('Create Error:', err);
            if (err.error && err.error.errors) {
              alert('Validation Error: ' + JSON.stringify(err.error.errors, null, 2));
            } else {
              alert('An error occurred. Check the console.');
            }
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/hotels']);
  }
}
