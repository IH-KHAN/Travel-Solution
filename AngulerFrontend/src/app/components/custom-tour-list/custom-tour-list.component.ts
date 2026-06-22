import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-custom-tour-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './custom-tour-list.component.html',
  styleUrls: ['./custom-tour-list.component.css']
})
export class CustomTourListComponent implements OnInit {
  customTours: any[] = [];
  displayedColumns: string[] = ['customTourRequestId', 'userName', 'userEmail', 'phone', 'numOfTravelers', 'dates', 'totalBudget', 'status', 'actions'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCustomTours();
  }

  loadCustomTours(): void {
    this.apiService.getAll<any>('CustomTours').subscribe({
      next: (data) => {
        this.customTours = data;
      },
      error: (err) => console.error('Failed to load custom tours', err)
    });
  }

  deleteCustomTour(id: number): void {
    if (confirm('Are you sure you want to delete this custom tour request?')) {
      this.apiService.delete('CustomTours', id).subscribe({
        next: () => {
          this.loadCustomTours();
        },
        error: (err) => console.error('Failed to delete custom tour', err)
      });
    }
  }

  getStatusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'completed') return 'primary';
    if (s === 'cancelled' || s === 'rejected') return 'warn';
    return 'accent';
  }
}
