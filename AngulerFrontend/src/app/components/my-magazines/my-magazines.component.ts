import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-my-magazines',
  templateUrl: './my-magazines.component.html',
  styleUrls: ['./my-magazines.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule]
})
export class MyMagazinesComponent implements OnInit {
  completedPackages: any[] = [];
  displayedColumns: string[] = ['packageCode', 'packageTitle', 'duration', 'actions'];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isDownloadingMagazine: { [key: number]: boolean } = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchMyCompletedPackages();
  }

  fetchMyCompletedPackages(): void {
    this.apiService.getAll<any>('Packages/MyCompleted').subscribe({
      next: (data) => {
        this.completedPackages = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching my magazines', err);
        this.errorMessage = `Failed to load your magazines. Server responded: ${err.status} ${err.statusText}`;
        this.isLoading = false;
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
}
