import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-activity-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './activity-modal.component.html',
  styleUrls: ['./activity-modal.component.css']
})
export class ActivityModalComponent implements OnInit {
  activitiesForm!: FormGroup;

  activityTypes = ['Transport', 'Hotel', 'Meal', 'SpotVisit', 'MidwayBreak', 'Other'];
  transportationTypes = ['Bus', 'Train', 'Ship', 'Microbus', 'Minibus', 'Flight', 'Others'];
  
  hotels: any[] = [];
  restaurants: any[] = [];
  tourSpots: any[] = [];
  timeSlots: string[] = this.generateTimeSlots();

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<ActivityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { activities: any[], targetRegionType?: string, targetRegionId?: number }
  ) {}

  ngOnInit(): void {
    this.activitiesForm = this.fb.group({
      activities: this.fb.array([])
    });

    this.fetchMasterData();
  }

  fetchMasterData(): void {
    forkJoin({
      hotels: this.apiService.getAll<any[]>('Hotels'),
      restaurants: this.apiService.getAll<any[]>('Restaurants/MasterDetail'),
      tourSpots: this.apiService.getAll<any[]>('TourSpots'),
      locations: this.apiService.getAll<any>('Locations'),
      districts: this.apiService.getAll<any>('Districts')
    }).subscribe(res => {
      this.hotels = res.hotels;
      this.restaurants = res.restaurants.map((r: any) => {
        const allMenus: any[] = [];
        if (r.breakfasts) allMenus.push(...r.breakfasts.map((m: any) => ({ ...m, type: 'Breakfast' })));
        if (r.lunches) allMenus.push(...r.lunches.map((m: any) => ({ ...m, type: 'Lunch' })));
        if (r.dinners) allMenus.push(...r.dinners.map((m: any) => ({ ...m, type: 'Dinner' })));
        return { ...r, allMenus };
      });
      
      this.tourSpots = res.tourSpots;

      // Filter tour spots to only show those in the target region
      if (this.data && this.data.targetRegionType && this.data.targetRegionId) {
        const regionId = Number(this.data.targetRegionId);
        let validLocationIds: number[] = [];
        
        if (this.data.targetRegionType === 'Division') {
          const divDistricts = res.districts.filter(d => Number(d.divisionId) === regionId).map(d => Number(d.districtId));
          validLocationIds = res.locations.filter(l => divDistricts.includes(Number(l.districtId))).map(l => Number(l.locationId));
        } else if (this.data.targetRegionType === 'District') {
          validLocationIds = res.locations.filter(l => Number(l.districtId) === regionId).map(l => Number(l.locationId));
        }

        this.tourSpots = this.tourSpots.filter((ts: any) => validLocationIds.includes(Number(ts.locationId)));
      }

      if (this.data && this.data.activities && this.data.activities.length > 0) {
        this.data.activities.forEach(a => this.addActivity(a));
      } else {
        this.addActivity();
      }
    });
  }

  getMenusForRestaurant(restaurantId: number): any[] {
    const restaurant = this.restaurants.find(r => r.restaurantId === restaurantId);
    return restaurant ? restaurant.allMenus || [] : [];
  }

  get activities(): FormArray {
    return this.activitiesForm.get('activities') as FormArray;
  }

  addActivity(existingData: any = null): void {
    let details = existingData?.details || {};
    
    if (typeof details === 'string') {
        try { details = JSON.parse(details); } catch(e) {}
    }

    const activityGroup = this.fb.group({
      activityId: [existingData?.activityId || 0],
      activityName: [existingData?.activityName || '', Validators.required],
      activityType: [existingData?.activityType || '', Validators.required],
      plannedDate: [existingData?.plannedTime ? new Date(existingData.plannedTime) : null, Validators.required],
      plannedHour: [existingData?.plannedTime ? this.formatTimeForInput(existingData.plannedTime) : ''],
      actualTime: [existingData?.actualTime ? this.formatDateForInput(existingData.actualTime) : null],
      projectedCost: [existingData?.projectedCost || 0, [Validators.required, Validators.min(0)]],
      activityDescription: [existingData?.activityDescription || ''],
      
      hotelId: [details.hotelId || details.HotelId || null],
      transportationType: [details.transportationType || details.TransportationType || null],
      restaurantId: [details.restaurantId || details.RestaurantId || null],
      menuId: [details.menuId || details.MenuId || null],
      tourSpotId: [details.tourSpotId || details.TourSpotId || null],
      remarks: [details.remarks || details.Remarks || ''],
      miscellaneousCost: [details.miscellaneousCost || details.MiscelleneousCost || 0]
    });

    activityGroup.get('menuId')?.valueChanges.subscribe(menuId => {
      if (menuId) {
        const restaurantId = activityGroup.get('restaurantId')?.value;
        const menus = this.getMenusForRestaurant(restaurantId);
        const selectedMenu = menus.find(m => m.menuId === menuId);
        if (selectedMenu) {
          if (selectedMenu.itemPrice) {
            activityGroup.get('projectedCost')?.setValue(selectedMenu.itemPrice);
          }
          
          // Auto-fill time from menu if available
          let menuTime: any = null;
          if (selectedMenu.type === 'Breakfast' && selectedMenu.breakfastTime) menuTime = selectedMenu.breakfastTime;
          else if (selectedMenu.type === 'Lunch' && selectedMenu.lunchTime) menuTime = selectedMenu.lunchTime;
          else if (selectedMenu.type === 'Dinner' && selectedMenu.dinnerTime) menuTime = selectedMenu.dinnerTime;

          if (menuTime) {
            const formatted = this.formatTimeForInput(menuTime);
            if (formatted) {
              activityGroup.get('plannedHour')?.setValue(formatted);
            }
          }
        }
      }
    });

    // Dynamic Validation for Conditional Fields based on Activity Type
    const updateValidators = (type: string) => {
      activityGroup.get('hotelId')?.clearValidators();
      activityGroup.get('transportationType')?.clearValidators();
      activityGroup.get('restaurantId')?.clearValidators();
      activityGroup.get('tourSpotId')?.clearValidators();

      if (type === 'Hotel') {
        activityGroup.get('hotelId')?.setValidators(Validators.required);
      } else if (type === 'Transport') {
        activityGroup.get('transportationType')?.setValidators(Validators.required);
      } else if (type === 'Meal') {
        activityGroup.get('restaurantId')?.setValidators(Validators.required);
      } else if (type === 'SpotVisit') {
        activityGroup.get('tourSpotId')?.setValidators(Validators.required);
      }

      activityGroup.get('hotelId')?.updateValueAndValidity({ emitEvent: false });
      activityGroup.get('transportationType')?.updateValueAndValidity({ emitEvent: false });
      activityGroup.get('restaurantId')?.updateValueAndValidity({ emitEvent: false });
      activityGroup.get('tourSpotId')?.updateValueAndValidity({ emitEvent: false });
    };

    const initialType = activityGroup.get('activityType')?.value;
    if (initialType) {
      updateValidators(initialType);
    }

    activityGroup.get('activityType')?.valueChanges.subscribe(type => {
      updateValidators(type);
    });

    this.activities.push(activityGroup);
  }

  private formatDateForInput(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    
    const yyyy = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mo}-${dd}T${hr}:${min}`;
  }

  private formatTimeForInput(dateStr: string | Date): string {
    if (!dateStr) return '';
    let d: Date = new Date(dateStr);
    
    if (isNaN(d.getTime())) return '';
    
    let hh = d.getHours();
    let mm = d.getMinutes();
    
    // Round to nearest 15 mins
    mm = Math.round(mm / 15) * 15;
    if (mm >= 60) {
      mm = 0;
      hh = (hh + 1) % 24;
    }
    
    const hStr = String(hh).padStart(2, '0');
    const mStr = String(mm).padStart(2, '0');
    return `${hStr}:${mStr}`;
  }

  removeActivity(index: number): void {
    this.activities.removeAt(index);
  }

  onSave(): void {
    if (this.activitiesForm.valid) {
      const formValue = this.activitiesForm.value.activities;
      const mappedActivities = formValue.map((act: any) => {
        // Merge plannedDate + plannedHour into a single ISO string
        let plannedTime = act.plannedTime || null;
        if (act.plannedDate) {
          const d = new Date(act.plannedDate);
          if (act.plannedHour) {
            const [hh, mm] = act.plannedHour.split(':');
            d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
          }
          const yyyy = d.getFullYear();
          const mo = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const hr = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          const sec = String(d.getSeconds()).padStart(2, '0');
          plannedTime = `${yyyy}-${mo}-${dd}T${hr}:${min}:${sec}`;
        }
        let detailsObj: any = {};
        switch (act.activityType) {
          case 'Hotel':       detailsObj = { HotelId: act.hotelId }; break;
          case 'Transport':   detailsObj = { TransportationType: act.transportationType, Remarks: act.remarks }; break;
          case 'Meal':        detailsObj = { RestaurantId: act.restaurantId, MenuId: act.menuId }; break;
          case 'SpotVisit':   detailsObj = { TourSpotId: act.tourSpotId }; break;
          case 'MidwayBreak': detailsObj = { Remarks: act.remarks }; break;
          case 'Other':       detailsObj = { Remarks: act.remarks, MiscelleneousCost: act.miscellaneousCost }; break;
        }
        return {
          activityId: act.activityId,
          activityName: act.activityName,
          activityType: act.activityType,
          plannedTime: plannedTime,
          actualTime: act.actualTime,
          projectedCost: act.projectedCost,
          activityDescription: act.activityDescription,
          details: detailsObj
        };
      });
      this.dialogRef.close(mappedActivities);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
