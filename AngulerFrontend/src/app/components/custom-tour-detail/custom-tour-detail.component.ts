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
  selector: 'app-custom-tour-detail',
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
  templateUrl: './custom-tour-detail.component.html',
  styleUrls: ['./custom-tour-detail.component.css']
})
export class CustomTourDetailComponent implements OnInit {
  tourForm!: FormGroup;
  tourId: number | null = null;
  tourDetails: any = null;
  
  statusOptions = ['Pending', 'Approved', 'Completed', 'Cancelled'];

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
        this.tourId = +id;
        this.loadTour(this.tourId);
      }
    });
  }

  initForm(): void {
    this.tourForm = this.fb.group({
      customTourRequestId: [0],
      userID: [0],
      phone: ['', Validators.required],
      numOfTravelers: [1, Validators.min(1)],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: [''],
      totalBudget: [0, Validators.min(0)],
      status: ['Pending']
    });
  }

  loadTour(id: number): void {
    this.apiService.getById<any>('CustomTours', id).subscribe({
      next: (data) => {
        this.tourDetails = data;
        this.tourForm.patchValue({
          customTourRequestId: data.customTourRequestId,
          userID: data.userID,
          phone: data.phone,
          numOfTravelers: data.numOfTravelers,
          startDate: data.startDate ? new Date(data.startDate).toISOString().substring(0, 10) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().substring(0, 10) : '',
          description: data.description,
          totalBudget: data.totalBudget,
          status: data.status || 'Pending'
        });
      },
      error: (err) => console.error('Failed to load custom tour', err)
    });
  }

  onSubmit(): void {
    if (this.tourForm.valid && this.tourId) {
      const formValue = this.tourForm.value;
      this.apiService.update('CustomTours', this.tourId, formValue).subscribe({
        next: () => this.router.navigate(['/custom-tours']),
        error: (err) => console.error('Failed to update custom tour', err)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/custom-tours']);
  }
}
