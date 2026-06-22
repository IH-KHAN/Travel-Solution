import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { BreakfastModalComponent } from '../breakfast-modal/breakfast-modal.component';
import { LunchModalComponent } from '../lunch-modal/lunch-modal.component';
import { DinnerModalComponent } from '../dinner-modal/dinner-modal.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSlideToggleModule, 
    MatDialogModule
  ],
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.css']
})
export class RestaurantFormComponent implements OnInit {
  restaurantForm!: FormGroup;
  isEditMode = false;
  restaurantId: number | null = null;

  breakfasts: any[] = [];
  lunches: any[] = [];
  dinners: any[] = [];

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
        this.restaurantId = +id;
        this.loadRestaurantData(this.restaurantId);
      }
    });
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      restaurantId: [0],
      restaurantName: ['', Validators.required],
      location: ['', Validators.required],
      isOpen: [true]
    });
  }

  loadRestaurantData(id: number): void {
    this.apiService.getById<any>('Restaurants/MasterDetail', id).subscribe({
      next: (data) => {
        this.restaurantForm.patchValue({
          restaurantId: data.restaurantId,
          restaurantName: data.restaurantName,
          location: data.location,
          isOpen: data.isOpen
        });
        
        if (data.breakfasts) this.breakfasts = data.breakfasts;
        if (data.lunches) this.lunches = data.lunches;
        if (data.dinners) this.dinners = data.dinners;
      },
      error: (err) => console.error(err)
    });
  }

  // Breakfast Methods
  addBreakfast(): void {
    const dialogRef = this.dialog.open(BreakfastModalComponent, {
      width: '500px',
      data: { existingData: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakfasts.push(result);
        this.restaurantForm.markAsDirty();
      }
    });
  }

  editBreakfast(index: number): void {
    const dialogRef = this.dialog.open(BreakfastModalComponent, {
      width: '500px',
      data: { existingData: this.breakfasts[index] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakfasts[index] = result;
        this.restaurantForm.markAsDirty();
      }
    });
  }

  deleteBreakfast(index: number): void {
    this.breakfasts.splice(index, 1);
    this.restaurantForm.markAsDirty();
  }

  // Lunch Methods
  addLunch(): void {
    const dialogRef = this.dialog.open(LunchModalComponent, {
      width: '500px',
      data: { existingData: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lunches.push(result);
        this.restaurantForm.markAsDirty();
      }
    });
  }

  editLunch(index: number): void {
    const dialogRef = this.dialog.open(LunchModalComponent, {
      width: '500px',
      data: { existingData: this.lunches[index] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lunches[index] = result;
        this.restaurantForm.markAsDirty();
      }
    });
  }

  deleteLunch(index: number): void {
    this.lunches.splice(index, 1);
    this.restaurantForm.markAsDirty();
  }

  // Dinner Methods
  addDinner(): void {
    const dialogRef = this.dialog.open(DinnerModalComponent, {
      width: '500px',
      data: { existingData: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dinners.push(result);
        this.restaurantForm.markAsDirty();
      }
    });
  }

  editDinner(index: number): void {
    const dialogRef = this.dialog.open(DinnerModalComponent, {
      width: '500px',
      data: { existingData: this.dinners[index] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dinners[index] = result;
        this.restaurantForm.markAsDirty();
      }
    });
  }

  deleteDinner(index: number): void {
    this.dinners.splice(index, 1);
    this.restaurantForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.restaurantForm.valid) {
      const rawValues = this.restaurantForm.getRawValue();
      
      const formData = {
        ...rawValues,
        breakfasts: this.breakfasts,
        lunches: this.lunches,
        dinners: this.dinners
      };

      if (this.isEditMode && this.restaurantId) {
        this.apiService.update('Restaurants/MasterDetail', this.restaurantId, formData).subscribe({
          next: () => this.router.navigate(['/restaurants']),
          error: (err) => console.error(err)
        });
      } else {
        this.apiService.create('Restaurants/MasterDetail', formData).subscribe({
          next: () => this.router.navigate(['/restaurants']),
          error: (err) => console.error(err)
        });
      }
    }
  }

  parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1];
      const [hh, mm, ss] = timePart.split(':');
      const d = new Date();
      d.setHours(parseInt(hh, 10), parseInt(mm, 10), parseInt(ss || '0', 10), 0);
      return d;
    }
    return new Date(dateStr);
  }
}
