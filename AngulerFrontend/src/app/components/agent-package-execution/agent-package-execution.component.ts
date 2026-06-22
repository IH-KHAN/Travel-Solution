import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentService } from '../../services/agent.service';
import { ApiService } from '../../services/api.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-package-execution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-package-execution.component.html',
  styleUrls: ['./agent-package-execution.component.css']
})
export class AgentPackageExecutionComponent implements OnInit {
  packageId!: number;
  pkg: any;
  travellers: any[] = [];
  activities: any[] = [];
  
  showTravellerChecklist: boolean = false;
  firstActivityStarted: boolean = false;
  
  currentActivity: any;
  
  // Form fields for completion
  actualCost: number = 0;
  remarks: string = '';
  selectedFile: File | null = null;
  
  // Unplanned Activity Form
  showUnplannedForm: boolean = false;
  unplannedName: string = '';
  unplannedDesc: string = '';
  unplannedRemarks: string = '';

  get totalProjectedCost(): number {
    if (!this.currentActivity) return 0;
    const bookedCount = this.travellers ? this.travellers.length : 0;
    return (this.currentActivity.projectedCost || 0) * (bookedCount + 1);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agentService: AgentService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.packageId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPackageData();
  }

  loadPackageData(): void {
    // Re-using MasterDetail endpoint from TourPackageControllers
    this.apiService.getById<any>('Packages/MasterDetail', this.packageId).subscribe({
      next: (data) => {
        this.pkg = data;
        this.activities = this.pkg.activities || [];
        this.checkTourStatus();
      },
      error: (err) => console.error('Error fetching package details', err)
    });

    this.agentService.getPackageTravellers(this.packageId).subscribe({
      next: (data) => {
        this.travellers = data;
      },
      error: (err) => console.error('Error fetching travellers', err)
    });
  }

  checkTourStatus(): void {
    const completedCount = this.activities.filter(a => a.isCompleted).length;
    
    if (completedCount === 0) {
      this.showTravellerChecklist = true;
      this.firstActivityStarted = false;
    } else {
      this.showTravellerChecklist = false;
      this.firstActivityStarted = true;
    }

    this.currentActivity = this.activities.find(a => !a.isCompleted);
  }

  saveTravellerPresence(): void {
    const updates = this.travellers.map(t => ({
      travellerId: t.travellersId,
      isPresent: t.isPresent
    }));

    this.agentService.updateTravellerPresence(updates).subscribe({
      next: () => {
        alert('Traveller presence saved successfully.');
        this.showTravellerChecklist = false; // Hide checklist after saving
      },
      error: (err) => console.error('Error saving presence', err)
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  completeCurrentActivity(): void {
    if (!this.currentActivity) return;

    const formData = new FormData();
    formData.append('ActivityId', this.currentActivity.activityId.toString());
    formData.append('PackageId', this.packageId.toString());
    formData.append('ActualCost', this.actualCost.toString());
    formData.append('Remarks', this.remarks);
    if (this.selectedFile) {
      formData.append('InvoiceImage', this.selectedFile, this.selectedFile.name);
    }

    this.agentService.completeActivity(this.currentActivity.activityId, formData).subscribe({
      next: () => {
        alert('Activity completed!');
        this.actualCost = 0;
        this.remarks = '';
        this.selectedFile = null;
        this.loadPackageData(); // Reload to get next activity
      },
      error: (err) => console.error('Error completing activity', err)
    });
  }

  submitUnplannedActivity(): void {
    const data = {
      activityName: this.unplannedName,
      activityDescription: this.unplannedDesc,
      remarks: this.unplannedRemarks,
      packageId: this.packageId
    };

    this.agentService.addUnplannedActivity(data).subscribe({
      next: () => {
        alert('Unplanned activity added to the end of the queue!');
        this.showUnplannedForm = false;
        this.unplannedName = '';
        this.unplannedDesc = '';
        this.unplannedRemarks = '';
        this.loadPackageData();
      },
      error: (err) => console.error('Error adding unplanned activity', err)
    });
  }
}
