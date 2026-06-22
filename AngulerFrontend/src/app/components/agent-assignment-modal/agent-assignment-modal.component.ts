import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../services/api.service';
import { AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-assignment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './agent-assignment-modal.component.html',
  styleUrls: ['./agent-assignment-modal.component.css']
})
export class AgentAssignmentModalComponent implements OnInit {
  agents: any[] = [];
  selectedAgentId: number | null = null;
  commission: number = 0;
  packageId: number;
  packageTitle: string;

  // Current assignment info passed from parent
  currentAgentId: number | null = null;
  currentAgentName: string | null = null;

  loading = false;
  removing = false;
  mode: 'view' | 'assign' = 'view'; // 'view' shows current agent; 'assign' shows the form

  constructor(
    public dialogRef: MatDialogRef<AgentAssignmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private agentService: AgentService
  ) {
    this.packageId = data.packageId;
    this.packageTitle = data.packageTitle;
    this.currentAgentId = data.currentAgentId ?? null;
    this.currentAgentName = data.currentAgentName ?? null;
    // If no agent is assigned, go straight to assign mode
    this.mode = this.currentAgentId ? 'view' : 'assign';
  }

  ngOnInit(): void {
    this.apiService.getAll<any>('Users').subscribe({
      next: (users) => {
        this.agents = users.filter((u: any) => u.role === 'Agent');
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  onRemove(): void {
    if (!this.currentAgentId) return;
    if (!confirm(`Remove ${this.currentAgentName} from this package?`)) return;

    this.removing = true;
    this.apiService.delete('Agent/RemoveAssignment', this.currentAgentId).subscribe({
      next: () => {
        this.removing = false;
        this.dialogRef.close('removed');
      },
      error: (err) => {
        this.removing = false;
        console.error('Failed to remove assignment', err);
        alert('Failed to remove agent assignment.');
      }
    });
  }

  onSave(): void {
    if (!this.selectedAgentId) return;

    // If currently assigned, remove the old one first then assign new
    const doAssign = () => {
      const payload = {
        userId: this.selectedAgentId,
        packageId: this.packageId,
        agentCommission: this.commission,
        role: 'Agent'
      };
      this.agentService.assignAgent(payload).subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close('assigned');
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to assign agent', err);
          alert('Failed to assign agent.');
        }
      });
    };

    this.loading = true;
    if (this.currentAgentId) {
      // Remove existing assignment first (change scenario)
      this.apiService.delete('Agent/RemoveAssignment', this.currentAgentId).subscribe({
        next: () => doAssign(),
        error: (err) => {
          this.loading = false;
          console.error('Failed to remove old assignment', err);
          alert('Failed to update agent.');
        }
      });
    } else {
      doAssign();
    }
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
