import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-cover-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './edit-cover-modal.component.html',
  styleUrls: ['./edit-cover-modal.component.css']
})
export class EditCoverModalComponent implements OnInit, OnDestroy {
  packageId!: number;
  title: string = '';
  subtitle: string = '';
  dateText: string = '';
  issueText: string = '';
  existingImageUrl: string | null = null;
  selectedCoverFile: File | null = null;
  selectedCoverFileName: string | null = null;
  
  isSubmitting = false;
  isChanged = false;

  selectedTemplate: string = 'ClassicRoam';
  previewSubject = new Subject<void>();
  previewUrl: SafeResourceUrl | null = null;
  isPreviewLoading = false;

  templates = [
    { id: 'ClassicRoam', name: 'Classic Roam', desc: 'Elegant traditional design overlay with golden typography details' },
    { id: 'BoldMinimalist', name: 'Bold Minimalist', desc: 'Dark overlay with modern title block and golden margins indicator' },
    { id: 'TravelLuks', name: 'Nordic Minimalist', desc: 'Sleek Scandinavian design, gorgeous thin serif typography, and generous spacing' },
    { id: 'Fieldtrip', name: 'Fieldtrip', desc: 'Classic typewriter style beige card cover with fine border lines' },
    { id: 'Sakura', name: 'Sakura', desc: 'Soft pastel pink frame structure suited for nature and scenic tour snaps' },
    { id: 'NationalGeographic', name: 'Nat Geo inspired', desc: 'Legendary yellow border framing with stark dark overlay info blocks' },
    { id: 'VogueTravel', name: 'Vogue Travel', desc: 'Sophisticated typography, high-fashion cover overlay, and modern footer' },
    { id: 'ModernGrid', name: 'Modern Grid', desc: 'Balanced card style template with split grid description cards' },
    { id: 'GoldenRatio', name: 'Golden Ratio', desc: 'Elegant deep slate left sidebar paired with vertical right photo frame' },
    { id: 'PolaroidMemories', name: 'Serene Panorama', desc: 'Full panorama background photo with clean translucent overlay card' },
    { id: 'SunsetGlow', name: 'Sunset Glow', desc: 'Vibrant pink-to-purple gradient blend overlays for vacation vibes' },
    { id: 'ExplorerNotebook', name: 'Metro Journal', desc: 'Contemporary editorial layout with high-contrast text grid and asymmetrical frames' },
    { id: 'ArtDeco', name: 'Art Deco Luxury', desc: 'Double accent gold borders matching vintage black tie magazine aesthetics' },
    { id: 'MinimalLineArt', name: 'Editorial Split', desc: 'Modern split-pane design with vertical title block and large photo' },
    { id: 'AdventureTypography', name: 'Adventure Bold', desc: 'Striking bold lettering with central circular mask photo outline' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EditCoverModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      packageId: number, 
      packageTitle?: string, 
      packageCode?: string,
      description?: string,
      magazineCoverImage?: string,
      magazineCoverTitle?: string,
      magazineCoverSubtitle?: string,
      magazineCoverTemplate?: string,
      magazineCoverDateText?: string,
      magazineCoverIssueText?: string
    },
    private apiService: ApiService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.packageId = this.data.packageId;
    this.title = this.data.magazineCoverTitle || this.data.packageTitle || 'EXPLORER';
    this.subtitle = this.data.magazineCoverSubtitle || this.data.description || 'A photographic chronicle of our guided activities, scenic spots, and shared team moments.';
    this.selectedTemplate = this.data.magazineCoverTemplate || 'ClassicRoam';
    this.dateText = this.data.magazineCoverDateText || this.getFormattedDefaultDate();
    this.issueText = this.data.magazineCoverIssueText || `ISSUE ${this.data.packageCode || '01'}`;
    this.existingImageUrl = this.data.magazineCoverImage || null;

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

  getFormattedDefaultDate(): string {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
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
    formData.append('Subtitle', this.subtitle || '');
    formData.append('Template', this.selectedTemplate);
    formData.append('DateText', this.dateText || '');
    formData.append('IssueText', this.issueText || '');
    
    if (this.existingImageUrl) {
      formData.append('ExistingImageUrl', this.existingImageUrl);
    }
    
    if (this.selectedCoverFile) {
      formData.append('CoverImage', this.selectedCoverFile, this.selectedCoverFile.name);
    }

    return this.http.post(`http://localhost:5246/api/Magazine/packages/${this.packageId}/cover/preview`, formData, {
      responseType: 'blob'
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCoverFile = event.target.files[0];
      this.selectedCoverFileName = this.selectedCoverFile ? this.selectedCoverFile.name : null;
      this.triggerPreview();
    }
  }

  removeFile(): void {
    this.selectedCoverFile = null;
    this.selectedCoverFileName = null;
    this.triggerPreview();
  }

  deleteExistingCoverImage(): void {
    if (confirm('Are you sure you want to remove the cover image? The magazine will use package/activity pictures as a fallback.')) {
      this.existingImageUrl = null;
      this.isChanged = true;
      this.triggerPreview();
    }
  }

  previewFullMagazine(): void {
    this.isSubmitting = true;
    this.apiService.downloadFile(`Magazine/packages/${this.packageId}/download-pdf?inline=true`).subscribe({
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
  }

  onCancel(): void {
    this.dialogRef.close(this.isChanged);
  }

  submitCover(): void {
    if (!this.title) {
      alert('Please provide a cover title.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('Subtitle', this.subtitle || '');
    formData.append('Template', this.selectedTemplate);
    formData.append('DateText', this.dateText || '');
    formData.append('IssueText', this.issueText || '');
    
    if (this.existingImageUrl) {
      formData.append('ExistingImageUrl', this.existingImageUrl);
    }
    
    if (this.selectedCoverFile) {
      formData.append('CoverImage', this.selectedCoverFile, this.selectedCoverFile.name);
    }

    // Call the Magazine Controller API endpoint to save cover metadata
    this.apiService.create(`Magazine/packages/${this.packageId}/cover`, formData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert('Tour Magazine Cover configuration saved successfully!');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error uploading cover details:', err);
        alert('Failed to save cover details.');
      }
    });
  }
}
