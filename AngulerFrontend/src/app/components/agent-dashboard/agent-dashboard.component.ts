import { Component, OnInit } from '@angular/core';
import { AgentService } from '../../services/agent.service';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  packages: any[] = [];
  userId: number = 1; // Replace with actual logged-in user ID from Auth Service

  constructor(private agentService: AgentService, private router: Router) {}

  ngOnInit(): void {
    // In a real app, fetch userId from AuthService/Token
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = +storedUserId;
    }
    
    this.agentService.getAssignedPackages(this.userId).subscribe({
      next: (data) => {
        this.packages = data;
      },
      error: (err) => {
        console.error('Error fetching assigned packages', err);
      }
    });
  }

  goToExecution(packageId: number): void {
    this.router.navigate(['/agent/package', packageId]);
  }
}
