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
  selector: 'app-geography-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './geography-list.component.html',
  styleUrls: ['./geography-list.component.css']
})
export class GeographyListComponent implements OnInit {
  divisions: any[] = [];
  displayedColumns: string[] = ['divisionId', 'divisionName', 'actions'];

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadDivisions();
  }

  loadDivisions(): void {
    this.apiService.getAll<any>('Divisions/MasterDetail').subscribe({
      next: (data) => {
        this.divisions = data;
      },
      error: (err) => console.error(err)
    });
  }

  editDivision(id: number): void {
    this.router.navigate(['/geographies/edit', id]);
  }

  deleteDivision(id: number): void {
    if (confirm('Are you sure you want to delete this division?')) {
      this.apiService.delete('Divisions', id).subscribe({
        next: () => this.loadDivisions(),
        error: (err) => console.error(err)
      });
    }
  }
}
