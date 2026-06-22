import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './district-list.component.html',
  styleUrls: ['./district-list.component.css']
})
export class DistrictListComponent implements OnInit {
  districts: any[] = [];
  displayedColumns: string[] = ['districtId', 'districtName', 'divisionName', 'actions'];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadDistricts();
  }

  loadDistricts(): void {
    this.apiService.getAll<any>('Districts/MasterDetail').subscribe({
      next: (data) => {
        this.districts = data;
      },
      error: (err) => console.error(err)
    });
  }

  editDistrict(id: number): void {
    this.router.navigate(['/districts/edit', id]);
  }

  deleteDistrict(id: number): void {
    if (confirm('Are you sure you want to delete this district?')) {
      this.apiService.delete('Districts', id).subscribe({
        next: () => this.loadDistricts(),
        error: (err) => console.error(err)
      });
    }
  }
}
