import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-review-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './admin-review-list.component.html',
  styleUrls: ['./admin-review-list.component.css']
})
export class AdminReviewListComponent implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Filter properties
  selectedRating: number | string = 'all';
  selectedType: string = 'all';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.apiService.getAll<any>('Reviews').subscribe({
      next: (data) => {
        this.reviews = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.errorMessage = 'Failed to fetch reviews.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredReviews = this.reviews.filter(r => {
      // Rating filter
      if (this.selectedRating !== 'all' && r.rating !== Number(this.selectedRating)) {
        return false;
      }
      // Type filter
      if (this.selectedType !== 'all') {
        if (this.selectedType === 'hotel' && !r.hotelId) return false;
        if (this.selectedType === 'tour' && !r.packageID) return false;
      }
      return true;
    });
  }

  deleteReview(id: number): void {
    if (confirm('Are you sure you want to delete this review/rating?')) {
      this.apiService.delete('Reviews', id).subscribe({
        next: () => {
          this.successMessage = 'Review deleted successfully.';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadReviews();
        },
        error: (err) => {
          console.error('Failed to delete review', err);
          this.errorMessage = 'Failed to delete review.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
