import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SignalRService } from '../../services/signal-r.service';
import { Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-package-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-package-tracking.component.html',
  styleUrls: ['./admin-package-tracking.component.css']
})
export class AdminPackageTrackingComponent implements OnInit, OnDestroy {
  packageId!: number;
  packageDetails: any = null;
  activities: any[] = [];
  travellers: any[] = [];
  progressPercentage: number = 0;
  
  private signalRSubscription: Subscription | undefined;
  private travellerSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.packageId = +idParam;
      this.fetchPackageActivities();
      this.fetchTravellers();
    }

    this.signalRService.startConnection();

    this.signalRSubscription = this.signalRService.activityUpdate$.subscribe((update: any) => {
      console.log('Update in component:', update);
      if (update.packageId === this.packageId) {
        // Refetch to ensure we get the latest state and any newly added unplanned activities
        this.fetchPackageActivities();
      }
    });

    this.travellerSubscription = this.signalRService.travellerUpdate$.subscribe((update: any) => {
      console.log('Traveller update in component:', update);
      if (update.packageId === this.packageId) {
        this.fetchTravellers(); // Refresh travellers to get latest attendance
      }
    });
  }

  fetchPackageActivities() {
    this.http.get<any>(`http://localhost:5246/api/Packages/MasterDetail/${this.packageId}`).subscribe({
      next: (data) => {
        this.packageDetails = data;
        this.activities = data.activities || [];
        this.calculateProgress();
      },
      error: (err) => {
        console.error('Error fetching package details:', err);
      }
    });
  }

  fetchTravellers() {
    this.http.get<any[]>(`http://localhost:5246/api/Agent/GetPackageTravellers/${this.packageId}`).subscribe({
      next: (data) => {
        this.travellers = data || [];
      },
      error: (err) => {
        console.error('Error fetching travellers:', err);
      }
    });
  }

  calculateProgress() {
    if (this.activities.length === 0) {
      this.progressPercentage = 0;
      return;
    }
    const completed = this.activities.filter(a => a.isCompleted).length;
    this.progressPercentage = Math.round((completed / this.activities.length) * 100);
  }

  ngOnDestroy(): void {
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
    if (this.travellerSubscription) {
      this.travellerSubscription.unsubscribe();
    }
  }
}
