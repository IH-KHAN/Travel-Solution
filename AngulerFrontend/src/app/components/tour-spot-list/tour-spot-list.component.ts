import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tour-spot-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatTooltipModule
  ],
  templateUrl: './tour-spot-list.component.html',
  styleUrls: ['./tour-spot-list.component.css']
})
export class TourSpotListComponent implements OnInit {
  locations: any[] = [];
  displayedColumns: string[] = ['locationId', 'locationName', 'tourSpots', 'actions'];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAll<any>('TourSpots/MasterDetail').subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => console.error(err)
    });
  }

  editLocationSpots(id: number): void {
    this.router.navigate(['/tourspots/edit', id]);
  }

  deleteLocationSpots(id: number): void {
    if (confirm('Are you sure you want to delete all tour spots in this location?')) {
      const payload = {
        locationId: id,
        tourSpots: []
      };
      this.apiService.update('TourSpots/MasterDetail', id, payload).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }
}
