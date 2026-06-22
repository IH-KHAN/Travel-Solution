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
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatTooltipModule
  ],
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent implements OnInit {
  districts: any[] = [];
  displayedColumns: string[] = ['districtId', 'districtName', 'locations', 'actions'];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAll<any>('Locations/MasterDetail').subscribe({
      next: (data) => {
        this.districts = data;
      },
      error: (err) => console.error(err)
    });
  }

  editDistrictLocations(id: number): void {
    this.router.navigate(['/locations/edit', id]);
  }

  deleteDistrictLocations(id: number): void {
    if (confirm('Are you sure you want to delete all locations in this district?')) {
      const payload = {
        districtId: id,
        locations: []
      };
      this.apiService.update('Locations/MasterDetail', id, payload).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }
}
