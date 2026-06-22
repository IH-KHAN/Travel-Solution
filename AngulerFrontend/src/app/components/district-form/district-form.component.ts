import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-district-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './district-form.component.html',
  styleUrls: ['./district-form.component.css']
})
export class DistrictFormComponent implements OnInit {
  districtForm!: FormGroup;
  isEditMode = false;
  districtId: number | null = null;
  divisions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.districtForm = this.fb.group({
      districtId: [0],
      districtName: ['', Validators.required],
      divisionId: [null, Validators.required]
    });

    this.loadDivisions();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.districtId = +id;
        this.loadDistrict(this.districtId);
      }
    });
  }

  loadDivisions(): void {
    this.apiService.getAll<any>('Divisions').subscribe({
      next: (data) => this.divisions = data,
      error: (err) => console.error('Failed to load divisions', err)
    });
  }

  loadDistrict(id: number): void {
    this.apiService.getById<any>('Districts', id).subscribe({
      next: (data) => {
        this.districtForm.patchValue(data);
      },
      error: (err) => console.error('Failed to load district', err)
    });
  }

  onSubmit(): void {
    if (this.districtForm.valid) {
      if (this.isEditMode && this.districtId) {
        this.apiService.update('Districts', this.districtId, this.districtForm.value).subscribe({
          next: () => this.router.navigate(['/tourspots']),
          error: (err) => console.error(err)
        });
      } else {
        this.apiService.create('Districts', this.districtForm.value).subscribe({
          next: () => this.router.navigate(['/tourspots']),
          error: (err) => console.error(err)
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/tourspots']);
  }
}
