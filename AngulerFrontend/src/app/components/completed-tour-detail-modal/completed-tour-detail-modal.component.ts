import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AddMemoryModalComponent } from '../add-memory-modal/add-memory-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-completed-tour-detail-modal',
  templateUrl: './completed-tour-detail-modal.component.html',
  styleUrls: ['./completed-tour-detail-modal.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatTableModule, MatTooltipModule]
})
export class CompletedTourDetailModalComponent implements OnInit {
  packageDetails: any = null;
  isLoading: boolean = true;
  activityColumns: string[] = ['activityName', 'type', 'plannedTime', 'actualTime', 'projectedCost', 'actualCost', 'remarks', 'invoice', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { packageId: number },
    private dialogRef: MatDialogRef<CompletedTourDetailModalComponent>,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  get totalCost(): number {
    if (!this.packageDetails) return 0;
    return this.packageDetails.totalActualCost || 0;
  }

  ngOnInit(): void {
    this.fetchDetails();
  }

  fetchDetails(): void {
    this.apiService.getById<any>('Packages/Completed', `${this.data.packageId}/Details`).subscribe({
      next: (data) => {
        this.packageDetails = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching package details', err);
        this.isLoading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  openAddMemoryModal(activity: any): void {
    const dialogRef = this.dialog.open(AddMemoryModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: { 
        activityId: activity.activityId, 
        activityName: activity.activityName,
        postTourTitle: activity.postTourTitle,
        postTourDescription: activity.postTourDescription,
        postTourTemplate: activity.postTourTemplate,
        activityPictures: activity.activityPictures,
        packageId: this.data.packageId,
        activityType: activity.activityType,
        watermarkImage: activity.watermarkImage,
        watermarkOpacity: activity.watermarkOpacity
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchDetails();
      }
    });
  }
}
