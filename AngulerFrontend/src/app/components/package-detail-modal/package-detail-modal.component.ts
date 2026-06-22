import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-package-detail-modal',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDividerModule, MatBadgeModule
  ],
  templateUrl: './package-detail-modal.component.html',
  styleUrls: ['./package-detail-modal.component.css']
})
export class PackageDetailModalComponent implements OnInit {
  package: any;

  activityTypeIcons: Record<string, string> = {
    'Transport':   'directions_bus',
    'Hotel':       'hotel',
    'Meal':        'restaurant',
    'SpotVisit':   'place',
    'MidwayBreak': 'coffee',
    'Other':       'more_horiz'
  };

  activityTypeColors: Record<string, string> = {
    'Transport':   '#1565C0',
    'Hotel':       '#6A1B9A',
    'Meal':        '#E65100',
    'SpotVisit':   '#2E7D32',
    'MidwayBreak': '#F9A825',
    'Other':       '#546E7A'
  };

  constructor(
    public dialogRef: MatDialogRef<PackageDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.package = this.data?.package;
  }

  getActivityIcon(type: string): string {
    return this.activityTypeIcons[type] || 'event';
  }

  getActivityColor(type: string): string {
    return this.activityTypeColors[type] || '#546E7A';
  }

  parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr);
  }

  close(): void {
    this.dialogRef.close();
  }
}
