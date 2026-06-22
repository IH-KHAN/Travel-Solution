import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule, MatBadgeModule, MatChipsModule, MatTooltipModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  displayedColumns: string[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) { }

  get loggedInUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  get isAdminOrAudit(): boolean {
    const role = this.loggedInUserRole.toLowerCase();
    return role === 'admin' || role === 'audit';
  }

  get isAdmin(): boolean {
    return this.loggedInUserRole.toLowerCase() === 'admin';
  }

  get isAudit(): boolean {
    return this.loggedInUserRole.toLowerCase() === 'audit';
  }

  getAvailableRoles(targetUser: any): any[] {
    if (this.isAudit) {
      return this.roles;
    } else if (this.isAdmin) {
      // Admin can only assign role to Agent (RoleId = 2) or User (RoleId = 3)
      return this.roles.filter(r => r.roleId === 2 || r.roleId === 3);
    }
    return [];
  }

  canEditUser(targetUser: any): boolean {
    if (this.isAudit) {
      return true; // Audit can edit everyone
    }
    if (this.isAdmin) {
      // Admin cannot edit other Admin (RoleId = 1) or Audit (RoleId = 4)
      return targetUser.roleId !== 1 && targetUser.roleId !== 4;
    }
    return false;
  }

  ngOnInit(): void {
    // Set displayed columns dynamically based on Admin/Audit role permission
    this.displayedColumns = this.isAdminOrAudit
      ? ['userId', 'userName', 'email', 'phoneNumber', 'role', 'status', 'actions']
      : ['userId', 'userName', 'email', 'phoneNumber', 'role', 'status'];

    forkJoin({
      users: this.apiService.getAll<any>('Users'),
      roles: this.apiService.getAll<any>('Roles')
    }).subscribe({
      next: (res) => {
        this.users = res.users;
        this.roles = res.roles;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  updateUserRole(userId: number, roleId: number): void {
    this.apiService.update<any>('Users', `${userId}/role`, { roleId }).subscribe({
      next: () => alert('User role updated successfully!'),
      error: () => alert('Failed to update user role.')
    });
  }

  toggleBlock(user: any): void {
    const isSelf = localStorage.getItem('userName') === user.userName;
    if (isSelf) {
      alert('You cannot block or unblock yourself.');
      return;
    }
    this.apiService.update<any>('Users', `${user.userId}/toggle-block`, {}).subscribe({
      next: (res) => {
        user.isBlocked = res.isBlocked;
        user.IsBlocked = res.isBlocked;
        alert(res.message);
      },
      error: (err) => alert(err.error?.message || 'Failed to toggle block status.')
    });
  }

  getRoleName(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role?.roleName || 'Unknown';
  }
}

