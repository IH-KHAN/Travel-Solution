import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { GeographyListComponent } from '../geography-list/geography-list.component';
import { LocationListComponent } from '../location-list/location-list.component';
import { TourSpotListComponent } from '../tour-spot-list/tour-spot-list.component';

@Component({
  selector: 'app-tour-spot-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    GeographyListComponent,
    LocationListComponent,
    TourSpotListComponent
  ],
  templateUrl: './tour-spot-dashboard.component.html',
  styleUrls: ['./tour-spot-dashboard.component.css']
})
export class TourSpotDashboardComponent implements OnInit {
  selectedTab = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Read ?tab=N from query params to restore the active tab
    this.route.queryParams.subscribe(params => {
      this.selectedTab = params['tab'] ? +params['tab'] : 0;
    });
  }
}
