import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-geography-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './geography-form.component.html',
  styleUrls: ['./geography-form.component.css']
})
export class GeographyFormComponent implements OnInit {
  geographyForm!: FormGroup;
  isEditMode = false;
  divisionId: number | null = null;

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
        this.isEditMode = true;
        this.divisionId = +id;
        this.loadDivisionData(this.divisionId);
      }
    });
  }

  initForm(): void {
    this.geographyForm = this.fb.group({
      divisionId: [0],
      divisionName: ['', Validators.required],
      districts: this.fb.array([])
    });
  }

  get districts(): FormArray {
    return this.geographyForm.get('districts') as FormArray;
  }

  addDistrict(): void {
    this.districts.push(this.fb.group({
      districtId: [0],
      districtName: ['', Validators.required]
    }));
  }

  removeDistrict(index: number): void {
    this.districts.removeAt(index);
  }

  loadDivisionData(id: number): void {
    this.apiService.getById<any>('Divisions/MasterDetail', id).subscribe({
      next: (data) => {
        this.geographyForm.patchValue({
          divisionId: data.divisionId,
          divisionName: data.divisionName
        });
        
        // Clear and reload districts
        this.districts.clear();
        if (data.districts && data.districts.length > 0) {
          data.districts.forEach((d: any) => {
            this.districts.push(this.fb.group({
              districtId: [d.districtId],
              districtName: [d.districtName, Validators.required]
            }));
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.geographyForm.valid) {
      const formData = this.geographyForm.value;
      if (this.isEditMode && this.divisionId) {
        this.apiService.update('Divisions/MasterDetail', this.divisionId, formData).subscribe({
          next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 0 } }),
          error: (err) => console.error(err)
        });
      } else {
        this.apiService.create('Divisions/MasterDetail', formData).subscribe({
          next: () => this.router.navigate(['/tourspots'], { queryParams: { tab: 0 } }),
          error: (err) => console.error(err)
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/tourspots'], { queryParams: { tab: 0 } });
  }
}
