import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-memory-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatTooltipModule,
    MatSliderModule
  ],
  templateUrl: './add-memory-modal.component.html',
  styleUrls: ['./add-memory-modal.component.css']
})
export class AddMemoryModalComponent implements OnInit, OnDestroy {
  title: string = '';
  description: string = '';
  selectedFiles: File[] = [];
  isSubmitting = false;
  isChanged = false;

  watermarkFile: File | null = null;
  watermarkOpacity: number = 0.2;
  existingWatermarkUrl: string | null = null;
  clearWatermark: boolean = false;

  selectedTemplate: string = 'StandardEditorial';
  previewSubject = new Subject<void>();
  previewUrl: SafeResourceUrl | null = null;
  isPreviewLoading = false;

  templates = [
    { id: 'StandardEditorial', name: 'Standard Editorial', desc: 'Alternating image gallery & text block columns' },
    { id: 'EditorLetter', name: 'Editor Letter', desc: 'Greeting template with single-column text and italic blockquote' },
    { id: 'EditorialDropCap', name: 'Editorial Drop Cap', desc: 'Traditional styled drop cap with wrapped text & offset photo' },
    { id: 'FullBackgroundHero', name: 'Full Background Hero', desc: 'Full-bleed image with dark gradient overlay & gold typography' },
    { id: 'GalleryFocus', name: 'Gallery Focus', desc: 'Split layout highlighting portrait image & thumbnail grid' },
    { id: 'MultiColumnGrid', name: 'Multi Column Grid', desc: 'Newspaper-style multi-column grid with structured text' },
    { id: 'MinimalistQuote', name: 'Minimalist Quote', desc: 'Large elegant quote with high-contrast serif quotation marks' },
    { id: 'AsymmetricSplit', name: 'Asymmetric Split', desc: 'Bold asymmetric photo sizes spanning across columns' },
    { id: 'TwoThirdsImage', name: 'Two Thirds Image', desc: 'Hero horizontal image on top, 3 details columns on bottom' }
  ];

  constructor(
    public dialogRef: MatDialogRef<AddMemoryModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      activityId: number, 
      activityName: string, 
      postTourTitle?: string, 
      postTourDescription?: string, 
      postTourTemplate?: string,
      activityPictures?: { activityPictureId: number, picUrl: string }[],
      packageId?: number,
      activityType?: any,
      watermarkImage?: string,
      watermarkOpacity?: number
    },
    private apiService: ApiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.data.postTourTitle) {
      this.title = this.data.postTourTitle;
    }
    if (this.data.postTourDescription) {
      this.description = this.data.postTourDescription;
    }
    this.selectedTemplate = this.data.postTourTemplate || 'StandardEditorial';

    if (this.data.watermarkImage) {
      this.existingWatermarkUrl = this.data.watermarkImage;
    }
    if (this.data.watermarkOpacity !== undefined && this.data.watermarkOpacity !== null) {
      this.watermarkOpacity = this.data.watermarkOpacity;
    } else {
      this.watermarkOpacity = 0.2;
    }

    // Set up debounced preview logic
    this.previewSubject.pipe(
      debounceTime(500),
      switchMap(() => {
        this.isPreviewLoading = true;
        return this.getPreviewBlob();
      })
    ).subscribe({
      next: (blob) => {
        this.isPreviewLoading = false;
        if (this.previewUrl) {
          URL.revokeObjectURL((this.previewUrl as any).changingThisBreaksApplicationSecurity || '');
        }
        const rawUrl = URL.createObjectURL(blob);
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      },
      error: (err) => {
        this.isPreviewLoading = false;
        console.error('Error generating preview:', err);
      }
    });

    // Trigger initial preview
    this.triggerPreview();
  }

  ngOnDestroy(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL((this.previewUrl as any).changingThisBreaksApplicationSecurity || '');
    }
  }

  triggerPreview(): void {
    this.previewSubject.next();
  }

  selectTemplate(templateId: string): void {
    this.selectedTemplate = templateId;
    this.triggerPreview();
  }

  getPreviewBlob() {
    const formData = new FormData();
    formData.append('Title', this.title || '');
    formData.append('Description', this.description || '');
    formData.append('Template', this.selectedTemplate);
    
    // Map activityType
    let typeVal = 3; // SpotVisit default
    if (this.data.activityType !== undefined && this.data.activityType !== null) {
      const typeStr = this.data.activityType.toString().toLowerCase();
      if (typeStr.includes('transport') || this.data.activityType === 0) typeVal = 0;
      else if (typeStr.includes('hotel') || this.data.activityType === 1) typeVal = 1;
      else if (typeStr.includes('meal') || this.data.activityType === 2) typeVal = 2;
      else if (typeStr.includes('spot') || this.data.activityType === 3) typeVal = 3;
      else if (typeStr.includes('midway') || this.data.activityType === 4) typeVal = 4;
      else if (typeStr.includes('other') || this.data.activityType === 5) typeVal = 5;
      else if (typeStr.includes('unplanned') || this.data.activityType === 6) typeVal = 6;
    }
    formData.append('ActivityType', typeVal.toString());

    // Existing pictures URL list
    if (this.data.activityPictures) {
      this.data.activityPictures.forEach(pic => {
        formData.append('ExistingImageUrls', pic.picUrl);
      });
    }

    // Add new files
    for (const file of this.selectedFiles) {
      formData.append('NewImages', file, file.name);
    }

    // Watermark fields
    formData.append('WatermarkOpacity', this.watermarkOpacity.toString());
    formData.append('ClearWatermark', this.clearWatermark.toString());
    if (this.existingWatermarkUrl) {
      formData.append('ExistingWatermarkUrl', this.existingWatermarkUrl);
    }
    if (this.watermarkFile) {
      formData.append('WatermarkFile', this.watermarkFile, this.watermarkFile.name);
    }

    return this.http.post('http://localhost:5246/api/Magazine/activities/preview', formData, {
      responseType: 'blob'
    });
  }

  onWatermarkSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.watermarkFile = event.target.files[0];
      this.clearWatermark = false;
      this.triggerPreview();
    }
  }

  removeWatermark(): void {
    this.watermarkFile = null;
    this.clearWatermark = true;
    this.triggerPreview();
  }

  getOpacityPercent(): number {
    return Math.round(this.watermarkOpacity * 100);
  }

  onFileSelected(event: any): void {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
      this.triggerPreview();
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.triggerPreview();
  }

  deleteUploadedPicture(pictureId: number, index: number): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.apiService.delete('Magazine/memories/pictures', pictureId).subscribe({
        next: () => {
          if (this.data.activityPictures) {
            this.data.activityPictures.splice(index, 1);
          }
          this.isChanged = true;
          this.triggerPreview();
        },
        error: (err) => {
          console.error('Error deleting image:', err);
          alert('Failed to delete the image.');
        }
      });
    }
  }

  previewFullMagazine(): void {
    if (this.data.packageId) {
      this.isSubmitting = true;
      this.apiService.downloadFile(`Magazine/packages/${this.data.packageId}/download-pdf?inline=true`).subscribe({
        next: (blob) => {
          this.isSubmitting = false;
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error downloading full magazine preview:', err);
          alert('Failed to load full magazine preview.');
        }
      });
    } else {
      alert('Package ID is not available.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(this.isChanged);
  }

  submitMemory(): void {
    if (!this.title || !this.title.trim()) {
      this.title = 'Lorem Ipsum Dolor Sit Amet';
    }
    if (!this.description || !this.description.trim()) {
      this.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit.';
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('Description', this.description);
    formData.append('Template', this.selectedTemplate);
    
    for (const file of this.selectedFiles) {
      formData.append('Images', file, file.name);
    }

    // Watermark fields
    formData.append('WatermarkOpacity', this.watermarkOpacity.toString());
    formData.append('ClearWatermark', this.clearWatermark.toString());
    if (this.watermarkFile) {
      formData.append('WatermarkFile', this.watermarkFile, this.watermarkFile.name);
    }

    // Call the Magazine Controller API endpoint
    this.apiService.create(`Magazine/activities/${this.data.activityId}/memory`, formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert('Memory saved successfully!');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error uploading memory:', err);
        alert('Failed to save memory.');
      }
    });
  }
}
