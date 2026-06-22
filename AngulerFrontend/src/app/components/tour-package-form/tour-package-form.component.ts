import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivityModalComponent } from '../activity-modal/activity-modal.component';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-tour-package-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './tour-package-form.component.html',
  styleUrls: ['./tour-package-form.component.css']
})
export class TourPackageFormComponent implements OnInit {
  packageForm!: FormGroup;
  isEditMode = false;
  packageId: number | null = null;
  activities: any[] = []; // Store activities locally until form is saved
  districts: any[] = [];
  divisions: any[] = [];
  regions: any[] = []; // Store grouped regions (Divisions and Districts)
  pictures: any[] = []; // Store selected pictures

  // Toggles for percent vs amount
  markupIsPercent = false;
  discountIsPercent = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchLocations();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.packageId = +id;
        this.loadPackageData(this.packageId);
      }
    });

    // Listen to changes to auto-calculate price
    this.packageForm.get('maxTourist')?.valueChanges.subscribe(() => this.calculatePrice());
    this.packageForm.get('markUpAmount')?.valueChanges.subscribe(() => this.calculatePrice());
    this.packageForm.get('discount')?.valueChanges.subscribe(() => this.calculatePrice());
  }

  fetchLocations(): void {
    forkJoin({
      districts: this.apiService.getAll<any>('Districts'),
      divisions: this.apiService.getAll<any>('Divisions')
    }).subscribe({
      next: ({ districts, divisions }) => {
        this.districts = districts;
        this.divisions = divisions;

        // Group regions for the dropdown
        this.regions = [
          {
            groupName: 'Divisions',
            items: this.divisions.map(d => ({ type: 'Division', id: d.divisionId, name: `${d.divisionName} (Div)` }))
          },
          {
            groupName: 'Districts',
            items: this.districts.map(d => ({ type: 'District', id: d.districtId, name: `${d.districtName} (Dist)` }))
          }
        ];
      },
      error: (err) => console.error('Failed to load geography data', err)
    });
  }

  initForm(): void {
    this.packageForm = this.fb.group({
      packageId: [0],
      packageCode: ['', Validators.required],
      packageTitle: ['', Validators.required],
      description: [''],
      targetRegion: [null, Validators.required],
      durationDays: [1, Validators.min(1)],
      durationNight: [0, Validators.min(0)],
      maxTourist: [1, Validators.min(1)],
      markUpAmount: [0, Validators.min(0)],
      discount: [0, Validators.min(0)],
      rawActivitiesCost: [{ value: 0, disabled: true }],
      baseCostWithAgent: [{ value: 0, disabled: true }],
      packagePrice: [{ value: 0, disabled: true }],
      isActive: [true]
    });
  }

  loadPackageData(id: number): void {
    this.apiService.getById<any>('Packages/MasterDetail', id).subscribe({
      next: (data) => {
        const baseCost = data.packagePrice || 1;
        const displayMarkup = data.isMarkupPercent ? Math.round((data.markUpAmount / baseCost) * 100) : data.markUpAmount;
        const displayDiscount = data.isDiscountPercent ? Math.round((data.discount / baseCost) * 100) : data.discount;

        this.markupIsPercent = data.isMarkupPercent || false;
        this.discountIsPercent = data.isDiscountPercent || false;

        this.packageForm.patchValue({
          packageId: data.packageId,
          packageCode: data.packageCode,
          packageTitle: data.packageTitle,
          description: data.description,
          targetRegion: `${data.targetRegionType}_${data.targetRegionId}`,
          durationDays: data.durationDays,
          durationNight: data.durationNight,
          maxTourist: data.maxTourist,
          markUpAmount: displayMarkup,
          discount: displayDiscount,
          packagePrice: data.packagePrice,
          isActive: data.isActive
        });

        if (data.activities) {
          this.activities = [...data.activities];
        }

        if (data.pictures) {
          this.pictures = [...data.pictures];
        }

        this.calculatePrice();
      },
      error: (err) => console.error(err)
    });
  }

  toggleMarkupType(isPercent: boolean): void {
    this.markupIsPercent = isPercent;
    this.calculatePrice();
  }

  toggleDiscountType(isPercent: boolean): void {
    this.discountIsPercent = isPercent;
    this.calculatePrice();
  }

  calculatePrice(): void {
    // Base cost is sum of projected costs
    const rawSumActivitiesCost = this.activities.reduce((sum, act) => sum + (act.projectedCost || 0), 0);
    const sumActivitiesCost = Math.ceil(rawSumActivitiesCost); // Ceiling rounding

    // Calculate new base cost with agent proportional cost
    const maxTourist = this.packageForm.get('maxTourist')?.value || 1;
    const safeMaxTourist = Math.max(1, maxTourist); // Prevent division by zero
    const rawBaseCostWithAgent = (sumActivitiesCost * (safeMaxTourist + 1)) / safeMaxTourist;
    const baseCostWithAgent = Math.ceil(rawBaseCostWithAgent); // Ceiling rounding

    this.packageForm.patchValue({
      rawActivitiesCost: sumActivitiesCost,
      baseCostWithAgent: baseCostWithAgent
    }, { emitEvent: false });

    let markupInput = this.packageForm.get('markUpAmount')?.value || 0;
    let discountInput = this.packageForm.get('discount')?.value || 0;

    let finalMarkup = this.markupIsPercent ? (baseCostWithAgent * markupInput / 100) : markupInput;
    let finalDiscount = this.discountIsPercent ? (baseCostWithAgent * discountInput / 100) : discountInput;

    const finalPrice = baseCostWithAgent + finalMarkup - finalDiscount;
    this.packageForm.patchValue({ packagePrice: Math.max(0, finalPrice) }, { emitEvent: false });
  }

  openActivityModal(): void {
    const selectedRegion = this.packageForm.get('targetRegion')?.value;
    const [regionType, regionIdStr] = selectedRegion ? selectedRegion.split('_') : [null, null];
    const regionId = regionIdStr ? parseInt(regionIdStr, 10) : null;

    const dialogRef = this.dialog.open(ActivityModalComponent, {
      width: '700px',
      disableClose: true,
      data: {
        activities: [...this.activities],
        targetRegionType: regionType,
        targetRegionId: regionId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activities = result;
        this.calculatePrice(); // Recalculate if projected costs changed
        this.packageForm.markAsDirty();
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        this.apiService.create('Uploads/Temp', formData).subscribe({
          next: (res: any) => {
            if (res && res.url) {
              this.pictures.push({ pictureId: 0, picUrl: res.url });
              this.packageForm.markAsDirty();
            }
          },
          error: (err) => console.error('Upload failed', err)
        });
      }
      // Reset input
      event.target.value = '';
    }
  }

  removePicture(index: number): void {
    this.pictures.splice(index, 1);
    this.packageForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.packageForm.valid) {
      // Get raw value to include disabled packagePrice
      const rawValues = this.packageForm.getRawValue();
      const [targetRegionType, targetRegionId] = rawValues.targetRegion.split('_');

      const baseCostWithAgent = rawValues.baseCostWithAgent || 0;
      const finalMarkup = this.markupIsPercent ? (baseCostWithAgent * (rawValues.markUpAmount || 0) / 100) : (rawValues.markUpAmount || 0);
      const finalDiscount = this.discountIsPercent ? (baseCostWithAgent * (rawValues.discount || 0) / 100) : (rawValues.discount || 0);

      const formData = {
        ...rawValues,
        targetRegionType: targetRegionType,
        targetRegionId: parseInt(targetRegionId, 10),
        createdBy: this.getLoggedInUserId(),
        durationDays: rawValues.durationDays || 0,
        durationNight: rawValues.durationNight || 0,
        maxTourist: rawValues.maxTourist || 1,
        markUpAmount: finalMarkup,
        discount: finalDiscount,
        packagePrice: baseCostWithAgent,
        isMarkupPercent: this.markupIsPercent,
        isDiscountPercent: this.discountIsPercent,
        activities: this.activities,
        pictures: this.pictures
      };
      delete formData.targetRegion;

      if (this.isEditMode && this.packageId) {
        this.apiService.update('Packages/MasterDetail', this.packageId, formData).subscribe({
          next: () => this.router.navigate(['/packages']),
          error: (err) => {
            console.error('PUT 400 error body:', err.error);
            console.error(err);
          }
        });
      } else {
        this.apiService.create('Packages/MasterDetail', formData).subscribe({
          next: () => this.router.navigate(['/packages']),
          error: (err) => {
            console.error('POST 400 error body:', err.error);
            console.error(err);
          }
        });
      }
    }
  }

  /** Decodes the JWT from localStorage to retrieve the logged-in user's ID */
  private getLoggedInUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 1;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['UserId'] || payload['userId'] || '1', 10) || 1;
    } catch {
      return 1;
    }
  }

  cancel(): void {
    this.router.navigate(['/packages']);
  }
}
