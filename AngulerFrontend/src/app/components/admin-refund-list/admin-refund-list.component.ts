import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefundService, RefundDTO } from '../../services/refund.service';

@Component({
  selector: 'app-admin-refund-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-refund-list.component.html',
  styleUrls: ['./admin-refund-list.component.css']
})
export class AdminRefundListComponent implements OnInit {
  refunds: RefundDTO[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedRefund: RefundDTO | null = null;

  constructor(private refundService: RefundService) {}

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.loading = true;
    this.refundService.getRefunds().subscribe({
      next: (data) => {
        // Sort by created date descending (newest first)
        this.refunds = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load refund requests.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  approveRefund(refund: RefundDTO): void {
    const input = prompt(`Enter refund amount to approve (Max: ${refund.refundAmount}):`, refund.refundAmount.toString());
    if (input === null) return; // user cancelled
    
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0 || amount > refund.refundAmount) {
      alert(`Invalid amount. Must be greater than 0 and less than or equal to ${refund.refundAmount}.`);
      return;
    }

    const updatedRefund = { ...refund, refundAmount: amount };
    this.updateStatus(updatedRefund, 'Approved');
  }

  rejectRefund(refund: RefundDTO): void {
    if (confirm('Are you sure you want to reject this refund?')) {
      this.updateStatus(refund, 'Rejected');
    }
  }

  deleteRefund(refund: RefundDTO): void {
    if (confirm('Are you sure you want to permanently delete this refund request?')) {
      this.refundService.deleteRefund(refund.refundId).subscribe({
        next: () => {
          this.refunds = this.refunds.filter(r => r.refundId !== refund.refundId);
          this.successMessage = 'Refund request deleted successfully.';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete refund request.';
          console.error(err);
        }
      });
    }
  }

  openViewModal(refund: RefundDTO): void {
    this.selectedRefund = refund;
  }

  closeViewModal(): void {
    this.selectedRefund = null;
  }

  private updateStatus(refund: RefundDTO, status: string): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.refundService.updateRefund(refund.refundId, {
      refundId: refund.refundId,
      bookingId: refund.bookingId,
      bookingType: refund.bookingType,
      userId: refund.userId,
      refundAmount: refund.refundAmount,
      status: status,
      reason: refund.reason
    }).subscribe({
      next: (updated) => {
        const index = this.refunds.findIndex(r => r.refundId === updated.refundId);
        if (index !== -1) {
          this.refunds[index] = updated;
        }
        this.successMessage = `Refund ${status.toLowerCase()} successfully!`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = `Failed to mark as ${status}.`;
        console.error(err);
      }
    });
  }
}
