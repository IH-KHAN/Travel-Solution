import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tour-spot-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './tour-spot-form.component.html',
  styleUrls: ['./tour-spot-form.component.css']
})
export class TourSpotFormComponent implements OnInit {
  tourSpotForm!: FormGroup;
  locations: any[] = [];
  isEditMode = false;
  locationId: number | null = null;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Load locations for the dropdown
    this.apiService.getAll<any>('Locations').subscribe({
      next: (data) => (this.locations = data),
      error: (err) => console.error(err)
    });

    // Check if editing
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.locationId = +id;
        this.tourSpotForm.get('locationId')?.disable();
        this.loadTourSpotData(this.locationId);
      }
    });
  }

  initForm(): void {
    this.tourSpotForm = this.fb.group({
      locationId: [null, Validators.required],
      tourSpots: this.fb.array([])
    });
  }

  get tourSpots(): FormArray {
    return this.tourSpotForm.get('tourSpots') as FormArray;
  }

  addTourSpot(): void {
    this.tourSpots.push(this.fb.group({
      spotId: [0],
      spotName: ['', [Validators.required, Validators.maxLength(200)]]
    }));
  }

  removeTourSpot(index: number): void {
    this.tourSpots.removeAt(index);
  }

  onLocationChange(selectedLocationId: number): void {
    if (!this.isEditMode && selectedLocationId) {
      // Auto-load existing spots if any when creating new
      this.apiService.getById<any>('TourSpots/MasterDetail', selectedLocationId).subscribe({
        next: (data) => {
          this.tourSpots.clear();
          if (data && data.tourSpots && data.tourSpots.length > 0) {
            data.tourSpots.forEach((t: any) => {
              this.tourSpots.push(this.fb.group({
                spotId: [t.spotId],
                spotName: [t.spotName, [Validators.required, Validators.maxLength(200)]]
              }));
            });
          } else {
            this.addTourSpot();
          }
        },
        error: (err) => {
          this.tourSpots.clear();
          this.addTourSpot();
        }
      });
    }
  }

  loadTourSpotData(id: number): void {
    this.apiService.getById<any>('TourSpots/MasterDetail', id).subscribe({
      next: (data) => {
        this.tourSpotForm.patchValue({
          locationId: data.locationId
        });
        
        this.tourSpots.clear();
        if (data.tourSpots && data.tourSpots.length > 0) {
          data.tourSpots.forEach((t: any) => {
            this.tourSpots.push(this.fb.group({
              spotId: [t.spotId],
              spotName: [t.spotName, [Validators.required, Validators.maxLength(200)]]
            }));
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.tourSpotForm.invalid) return;
    this.isSaving = true;
    const formData = this.tourSpotForm.getRawValue();

    if (this.isEditMode && this.locationId) {
      this.apiService.update('TourSpots/MasterDetail', this.locationId, formData).subscribe({
        next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 2 } }),
        error: (err) => { console.error(err); this.isSaving = false; }
      });
    } else {
      this.apiService.create('TourSpots/MasterDetail', formData).subscribe({
        next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 2 } }),
        error: (err) => { 
          // Fallback to PUT if POST fails due to existing spots
          this.apiService.update('TourSpots/MasterDetail', formData.locationId, formData).subscribe({
            next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 2 } }),
            error: (err2) => { console.error(err2); this.isSaving = false; }
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tourspots'], { queryParams: { tab: 2 } });
  }
}
