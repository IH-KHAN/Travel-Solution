import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  restaurants: any[] = [];
  displayedColumns: string[] = ['restaurantId', 'restaurantName', 'location', 'isOpen', 'actions'];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.apiService.getAll<any>('Restaurants').subscribe({
      next: (data) => {
        this.restaurants = data;
      },
      error: (err) => console.error(err)
    });
  }

  editRestaurant(id: number): void {
    this.router.navigate(['/restaurants/edit', id]);
  }

  deleteRestaurant(id: number): void {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      this.apiService.delete('Restaurants', id).subscribe({
        next: () => this.loadRestaurants(),
        error: (err) => console.error(err)
      });
    }
  }
}
