import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PackageDetailModalComponent } from '../package-detail-modal/package-detail-modal.component';
import { AgentAssignmentModalComponent } from '../agent-assignment-modal/agent-assignment-modal.component';

@Component({
  selector: 'app-tour-package-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatTooltipModule],
  templateUrl: './tour-package-list.component.html',
  styleUrls: ['./tour-package-list.component.css']
})
export class TourPackageListComponent implements OnInit {
  packages: any[] = [];
  displayedColumns: string[] = ['packageId', 'packageCode', 'packageTitle', 'packagePrice', 'availableVacancy', 'assignedAgent', 'status', 'actions'];

  constructor(private apiService: ApiService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.apiService.getAll<any>('Packages').subscribe({
      next: (data) => {
        this.packages = data;
      },
      error: (err) => console.error(err)
    });
  }

  viewPackage(id: number): void {
    this.apiService.getById<any>('Packages/MasterDetail', id).subscribe({
      next: (pkg) => {
        this.dialog.open(PackageDetailModalComponent, {
          width: '700px',
          maxWidth: '95vw',
          data: { package: pkg }
        });
      },
      error: (err) => console.error(err)
    });
  }

  editPackage(id: number): void {
    this.router.navigate(['/packages/edit', id]);
  }

  trackPackage(id: number): void {
    this.router.navigate(['/packages/track', id]);
  }

  deletePackage(id: number): void {
    if (confirm('Are you sure you want to delete this package? All related bookings and data will also be removed.')) {
      this.apiService.delete('Packages', id).subscribe({
        next: () => this.loadPackages(),
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || err?.message || 'An unknown error occurred.';
          alert('Failed to delete package: ' + msg);
        }
      });
    }
  }



  openAssignAgentModal(pkg: any): void {
    const dialogRef = this.dialog.open(AgentAssignmentModalComponent, {
      width: '450px',
      data: {
        packageId: pkg.packageId,
        packageTitle: pkg.packageTitle,
        currentAgentId: pkg.assignedAgentId,
        currentAgentName: pkg.assignedAgentName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.loadPackages();
      }
    });
  }
}
