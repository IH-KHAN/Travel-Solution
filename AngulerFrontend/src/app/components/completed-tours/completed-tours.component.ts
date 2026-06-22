import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompletedTourDetailModalComponent } from '../completed-tour-detail-modal/completed-tour-detail-modal.component';
import { EditCoverModalComponent } from '../edit-cover-modal/edit-cover-modal.component';

@Component({
  selector: 'app-completed-tours',
  templateUrl: './completed-tours.component.html',
  styleUrls: ['./completed-tours.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule]
})
export class CompletedToursComponent implements OnInit {
  completedPackages: any[] = [];
  displayedColumns: string[] = ['packageId', 'packageCode', 'packageTitle', 'assignedAgent', 'duration', 'actions'];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isDownloading: { [key: number]: boolean } = {};
  isDownloadingMagazine: { [key: number]: boolean } = {};

  constructor(private apiService: ApiService, private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.fetchCompletedPackages();
  }

  fetchCompletedPackages(): void {
    this.apiService.getAll<any>('Packages/Completed').subscribe({
      next: (data) => {
        this.completedPackages = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching completed packages', err);
        this.errorMessage = `Failed to load completed packages. Server responded: ${err.status} ${err.statusText}`;
        this.isLoading = false;
      }
    });
  }

  downloadReport(packageId: number, packageCode: string): void {
    this.isDownloading[packageId] = true;
    
    // Open a new tab immediately to prevent popup blockers
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write('<html><head><title>Loading Report...</title><style>body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #1e293b; }</style></head><body><div style="text-align: center;"><h2>Generating Tour Report & Invoice...</h2><p style="color: #64748b;">Please wait while the system compiles the report details.</p></div></body></html>');
    }

    this.apiService.downloadFile(`Packages/Completed/${packageId}/Report`).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        if (pdfWindow) {
          pdfWindow.location.href = url;
        } else {
          // Fallback if tab opening was blocked
          window.open(url, '_blank');
        }
        this.isDownloading[packageId] = false;
      },
      error: (err) => {
        console.error('Error generating report', err);
        if (pdfWindow) {
          pdfWindow.close();
        }
        alert('Failed to load report. Please try again.');
        this.isDownloading[packageId] = false;
      }
    });
  }

  downloadMagazine(packageId: number, packageCode: string): void {
    this.isDownloadingMagazine[packageId] = true;
    
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write('<html><head><title>Loading Tour Magazine...</title><style>body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #1e293b; }</style></head><body><div style="text-align: center;"><h2>Generating Tour Magazine...</h2><p style="color: #64748b;">Gathering memories and designing your magazine layout.</p></div></body></html>');
    }

    this.apiService.downloadFile(`Magazine/packages/${packageId}/download-pdf`).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        if (pdfWindow) {
          pdfWindow.location.href = url;
        } else {
          window.open(url, '_blank');
        }
        this.isDownloadingMagazine[packageId] = false;
      },
      error: (err) => {
        console.error('Error generating magazine', err);
        if (pdfWindow) {
          pdfWindow.close();
        }
        alert('Failed to load magazine. Please try again.');
        this.isDownloadingMagazine[packageId] = false;
      }
    });
  }

  viewDetails(packageId: number): void {
    this.dialog.open(CompletedTourDetailModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: { packageId: packageId },
      disableClose: false,
      autoFocus: false
    });
  }

  openCoverModal(element: any): void {
    const dialogRef = this.dialog.open(EditCoverModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: {
        packageId: element.packageId,
        packageTitle: element.packageTitle,
        packageCode: element.packageCode,
        description: element.description,
        magazineCoverImage: element.magazineCoverImage,
        magazineCoverTitle: element.magazineCoverTitle,
        magazineCoverSubtitle: element.magazineCoverSubtitle,
        magazineCoverTemplate: element.magazineCoverTemplate,
        magazineCoverDateText: element.magazineCoverDateText,
        magazineCoverIssueText: element.magazineCoverIssueText
      },
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchCompletedPackages();
      }
    });
  }

  clonePackage(id: number): void {
    if (confirm('Are you sure you want to clone this completed package? The new package will be created as a Draft and you will be redirected to edit it.')) {
      this.apiService.create(`Packages/Clone/${id}`, {}).subscribe({
        next: (response: any) => {
          if (response && response.clonedPackageId) {
            // Route to the edit page of the newly cloned package
            this.router.navigate(['/packages/edit', response.clonedPackageId]);
          } else {
            this.fetchCompletedPackages();
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  deletePackage(id: number): void {
    if (confirm('Are you sure you want to delete this completed package? All related bookings, financial data, and reports will be permanently removed.')) {
      this.apiService.delete('Packages', id).subscribe({
        next: () => this.fetchCompletedPackages(),
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || err?.message || 'An unknown error occurred.';
          alert('Failed to delete package: ' + msg);
        }
      });
    }
  }
}
