import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.css']
})
export class HotelListComponent implements OnInit {
  hotels: any[] = [];
  displayedColumns: string[] = ['hotelId', 'hotelName', 'accommodationType', 'starRating', 'cityArea', 'rooms', 'isActive', 'actions'];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.apiService.getAll<any>('Hotels').subscribe({
      next: (data) => {
        this.hotels = data;
      },
      error: (err) => console.error(err)
    });
  }

  editHotel(id: number): void {
    this.router.navigate(['/hotels/edit', id]);
  }

  deleteHotel(id: number): void {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.apiService.delete('Hotels', id).subscribe({
        next: () => this.loadHotels(),
        error: (err) => console.error(err)
      });
    }
  }
}
