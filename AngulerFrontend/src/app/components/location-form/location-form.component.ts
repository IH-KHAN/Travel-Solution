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
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatTooltipModule
  ],
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.css']
})
export class LocationFormComponent implements OnInit {
  locationForm!: FormGroup;
  districts: any[] = [];
  isEditMode = false;
  districtId: number | null = null;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Load districts for the dropdown
    this.apiService.getAll<any>('Districts').subscribe({
      next: (data) => (this.districts = data),
      error: (err) => console.error(err)
    });

    // Check if editing
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.districtId = +id;
        this.locationForm.get('districtId')?.disable();
        this.loadLocationData(this.districtId);
      }
    });
  }

  initForm(): void {
    this.locationForm = this.fb.group({
      districtId: [null, Validators.required],
      locations: this.fb.array([])
    });
  }

  get locations(): FormArray {
    return this.locationForm.get('locations') as FormArray;
  }

  addLocation(): void {
    this.locations.push(this.fb.group({
      locationId: [0],
      locationName: ['', [Validators.required, Validators.maxLength(200)]]
    }));
  }

  removeLocation(index: number): void {
    this.locations.removeAt(index);
  }

  onDistrictChange(selectedDistrictId: number): void {
    if (!this.isEditMode && selectedDistrictId) {
      // Auto-load existing locations for this district so user doesn't accidentally overwrite
      this.apiService.getById<any>('Locations/MasterDetail', selectedDistrictId).subscribe({
        next: (data) => {
          this.locations.clear();
          if (data && data.locations && data.locations.length > 0) {
            data.locations.forEach((l: any) => {
              this.locations.push(this.fb.group({
                locationId: [l.locationId],
                locationName: [l.locationName, [Validators.required, Validators.maxLength(200)]]
              }));
            });
          } else {
            this.addLocation();
          }
        },
        error: () => {
          this.locations.clear();
          this.addLocation();
        }
      });
    }
  }

  loadLocationData(id: number): void {
    this.apiService.getById<any>('Locations/MasterDetail', id).subscribe({
      next: (data) => {
        this.locationForm.patchValue({
          districtId: data.districtId
        });

        this.locations.clear();
        if (data.locations && data.locations.length > 0) {
          data.locations.forEach((l: any) => {
            this.locations.push(this.fb.group({
              locationId: [l.locationId],
              locationName: [l.locationName, [Validators.required, Validators.maxLength(200)]]
            }));
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.locationForm.invalid) return;
    this.isSaving = true;
    const formData = this.locationForm.getRawValue();

    if (this.isEditMode && this.districtId) {
      this.apiService.update('Locations/MasterDetail', this.districtId, formData).subscribe({
        next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 1 } }),
        error: (err) => { console.error(err); this.isSaving = false; }
      });
    } else {
      this.apiService.create('Locations/MasterDetail', formData).subscribe({
        next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 1 } }),
        error: () => {
          // Fallback to PUT if district already has locations
          this.apiService.update('Locations/MasterDetail', formData.districtId, formData).subscribe({
            next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 1 } }),
            error: (err2) => { console.error(err2); this.isSaving = false; }
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tourspots'], { queryParams: { tab: 1 } });
  }
}
