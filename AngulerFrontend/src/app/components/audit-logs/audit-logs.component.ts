import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuditService, AuditDTO } from '../../services/audit.service';
import { SignalRService } from '../../services/signal-r.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit, OnDestroy {
  audits: AuditDTO[] = [];
  filteredAudits: AuditDTO[] = [];
  loading = false;
  errorMessage = '';

  // Filter criteria
  searchQuery = '';
  userFilter = '';
  selectedActionType = ''; // 'Added', 'Modified', 'Deleted', or '' for all
  startDate = '';
  endDate = '';
  sortOrder = 'newest'; // 'newest' or 'oldest'

  // Pagination
  currentPage = 1;
  pageSize = 15;
  totalPages = 1;

  private signalRSubscription: Subscription | undefined;
  private intervalId: any;

  constructor(
    private auditService: AuditService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadAudits();

    // Start SignalR connection and listen for realtime audit updates
    this.signalRService.startConnection();
    this.signalRSubscription = this.signalRService.auditUpdate$.subscribe({
      next: (newAudits: any) => {
        console.log('Real-time audits received in component:', newAudits);
        const incoming = Array.isArray(newAudits) ? newAudits : (newAudits ? [newAudits] : []);
        // Deduplicate: only add audits whose auditId is not already in the list
        const existingIds = new Set(this.audits.map(a => a.auditId));
        const unique = incoming.filter((a: any) => a.auditId && !existingIds.has(a.auditId));
        if (unique.length > 0) {
          this.audits = [...unique, ...this.audits];
          this.applyFilters();
        }
      },
      error: (err) => console.error('SignalR audit stream error:', err)
    });

    // Set up periodic update every 10 seconds to keep timestamps ticking in real-time
    this.intervalId = setInterval(() => {
      // Angular change detection will automatically recalculate relative times
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadAudits(): void {
    this.loading = true;
    this.errorMessage = '';
    this.auditService.getAudits().subscribe({
      next: (data) => {
        this.audits = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load system audit logs.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    if (this.sortOrder === 'preset-range') {
      this.startDate = '2026-05-12';
      this.endDate = '2026-05-20';
    }

    this.filteredAudits = this.audits.filter(a => {
      const matchesSearch = !this.searchQuery || 
        (a.action && a.action.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (a.auditId && a.auditId.toString().includes(this.searchQuery));

      const matchesUser = !this.userFilter ||
        (a.userName && a.userName.toLowerCase().includes(this.userFilter.toLowerCase())) ||
        (a.changedBy && a.changedBy.toString().includes(this.userFilter));

      const matchesActionType = !this.selectedActionType ||
        (a.action && a.action.toLowerCase().startsWith(this.selectedActionType.toLowerCase()));

      let matchesDateRange = true;
      if (a.changedAt) {
        const changedDate = new Date(a.changedAt);
        changedDate.setHours(0, 0, 0, 0);

        if (this.startDate) {
          const start = new Date(this.startDate);
          start.setHours(0, 0, 0, 0);
          if (changedDate < start) {
            matchesDateRange = false;
          }
        }

        if (this.endDate) {
          const end = new Date(this.endDate);
          end.setHours(0, 0, 0, 0);
          if (changedDate > end) {
            matchesDateRange = false;
          }
        }
      }

      return matchesSearch && matchesUser && matchesActionType && matchesDateRange;
    });

    // Apply Sorting
    this.filteredAudits.sort((a, b) => {
      const dateA = a.changedAt ? new Date(a.changedAt).getTime() : 0;
      const dateB = b.changedAt ? new Date(b.changedAt).getTime() : 0;
      return this.sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    this.currentPage = 1;
    this.calculatePagination();
  }

  onDateChange(): void {
    if (this.sortOrder === 'preset-range') {
      // If user manually changes date while in preset mode, reset back to newest
      this.sortOrder = 'newest';
    }
    this.applyFilters();
  }

  deleteAudit(id: number): void {
    if (confirm('Are you sure you want to permanently delete this system audit log? This action cannot be undone.')) {
      this.loading = true;
      this.errorMessage = '';
      this.auditService.deleteAudit(id).subscribe({
        next: () => {
          this.audits = this.audits.filter(a => a.auditId !== id);
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete system audit log.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  selectedAudits: Set<number> = new Set<number>();

  toggleSelection(id: number): void {
    if (this.selectedAudits.has(id)) {
      this.selectedAudits.delete(id);
    } else {
      this.selectedAudits.add(id);
    }
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedAudits.clear();
    } else {
      this.paginatedAudits.forEach(a => this.selectedAudits.add(a.auditId));
    }
  }

  isAllSelected(): boolean {
    return this.paginatedAudits.length > 0 && this.paginatedAudits.every(a => this.selectedAudits.has(a.auditId));
  }

  deleteSelectedAudits(): void {
    if (this.selectedAudits.size === 0) return;
    if (confirm(`Are you sure you want to permanently delete ${this.selectedAudits.size} selected system audit logs?`)) {
      this.loading = true;
      this.errorMessage = '';
      const ids = Array.from(this.selectedAudits);
      this.auditService.deleteAudits(ids).subscribe({
        next: () => {
          this.audits = this.audits.filter(a => !this.selectedAudits.has(a.auditId));
          this.selectedAudits.clear();
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete selected system audit logs.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAudits.length / this.pageSize) || 1;
  }

  get paginatedAudits(): AuditDTO[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAudits.slice(startIndex, startIndex + this.pageSize);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Relative real-time timestamp calculation
  getRelativeTime(dateInput: any): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const elapsedMs = now.getTime() - date.getTime();
    
    if (elapsedMs < 0) return 'just now'; // timezone skew safe
    if (elapsedMs < 1000) return 'just now';
    
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    if (elapsedSeconds < 60) {
      return `${elapsedSeconds}s ago`;
    }
    
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m ago`;
    }
    
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours}h ago`;
    }
    
    const elapsedDays = Math.floor(elapsedHours / 24);
    if (elapsedDays < 7) {
      return `${elapsedDays}d ago`;
    }
    
    // Fallback formatting for older audits
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Toggle date sort when clicking the Timestamp column header
  toggleDateSort(): void {
    this.sortOrder = this.sortOrder === 'newest' ? 'oldest' : 'newest';
    this.applyFilters();
  }

  // Download filtered audit logs as a professional PDF
  downloadPDF(): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Header Band ---
    doc.setFillColor(26, 37, 60); // Navy
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('System Audit Logs Report', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Travel Solution — Administrative Audit Trail`, pageWidth - 14, 14, { align: 'right' });

    // --- Summary Row ---
    const created = this.filteredAudits.filter(a => a.action?.toLowerCase().startsWith('created') || a.action?.toLowerCase().startsWith('added')).length;
    const updated = this.filteredAudits.filter(a => a.action?.toLowerCase().startsWith('updated') || a.action?.toLowerCase().startsWith('modified')).length;
    const deleted = this.filteredAudits.filter(a => a.action?.toLowerCase().startsWith('deleted')).length;

    doc.setFillColor(241, 245, 249); // Light gray
    doc.rect(0, 28, pageWidth, 12, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Records: ${this.filteredAudits.length}`, 14, 35);
    doc.text(`Created: ${created}    |    Updated: ${updated}    |    Deleted: ${deleted}`, 80, 35);
    if (this.startDate || this.endDate) {
      doc.text(`Date Range: ${this.startDate || '...'} to ${this.endDate || '...'}`, pageWidth - 14, 35, { align: 'right' });
    }

    // --- Table ---
    const tableData = this.filteredAudits.map(audit => {
      const parsed = this.parseAction(audit.action);
      const date = audit.changedAt ? new Date(audit.changedAt) : null;
      const dateStr = date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
      const timeStr = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

      // Build action detail text
      let actionDetail = parsed.entityType || 'Record';
      if (parsed.entityName) actionDetail += ` — ${parsed.entityName}`;
      if (parsed.changedFields) actionDetail += `\nFields: ${parsed.changedFields}`;

      return [
        `#${audit.auditId}`,
        parsed.verb || this.getActionBadge(audit.action),
        `${audit.userName || 'Unknown'} (ID: ${audit.changedBy})`,
        actionDetail,
        `${dateStr}\n${timeStr}`
      ];
    });

    autoTable(doc, {
      head: [['Log ID', 'Operation', 'Performed By', 'Action Details', 'Timestamp']],
      body: tableData,
      startY: 42,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.3,
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [26, 37, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 45 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 40, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: (data: any) => {
        // Color the Operation column based on verb
        if (data.section === 'body' && data.column.index === 1) {
          const val = (data.cell.raw as string || '').toLowerCase();
          if (val === 'created' || val === 'create') {
            data.cell.styles.textColor = [6, 95, 70];
            data.cell.styles.fillColor = [209, 250, 229];
          } else if (val === 'updated' || val === 'update') {
            data.cell.styles.textColor = [146, 64, 14];
            data.cell.styles.fillColor = [254, 243, 199];
          } else if (val === 'deleted' || val === 'delete') {
            data.cell.styles.textColor = [153, 27, 27];
            data.cell.styles.fillColor = [254, 226, 226];
          }
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 10, right: 10 },
      // Footer with page numbers
      didDrawPage: (data: any) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2, pageHeight - 8,
          { align: 'center' }
        );
        doc.text('Confidential — Travel Solution Audit System', 14, pageHeight - 8);
      }
    });

    // Generate filename with date
    const now = new Date();
    const fileName = `Audit_Logs_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
    doc.save(fileName);
  }

  // Visual helper to parse action types for styling badges
  getActionClass(action: string): string {
    if (!action) return 'badge-secondary';
    const lower = action.toLowerCase();
    if (lower.startsWith('added') || lower.startsWith('created')) return 'badge-success';
    if (lower.startsWith('modified') || lower.startsWith('updated')) return 'badge-warning';
    if (lower.startsWith('deleted')) return 'badge-danger';
    return 'badge-info';
  }

  // Get status pill text
  getActionBadge(action: string): string {
    if (!action) return 'Unknown';
    const lower = action.toLowerCase();
    if (lower.startsWith('added') || lower.startsWith('created')) return 'Create';
    if (lower.startsWith('modified') || lower.startsWith('updated')) return 'Update';
    if (lower.startsWith('deleted')) return 'Delete';
    return 'Action';
  }

  // Dynamic statistics
  get totalCount(): number {
    return this.audits.length;
  }

  get addCount(): number {
    return this.audits.filter(a => {
      const l = a.action?.toLowerCase() || '';
      return l.startsWith('added') || l.startsWith('created');
    }).length;
  }

  get modifyCount(): number {
    return this.audits.filter(a => {
      const l = a.action?.toLowerCase() || '';
      return l.startsWith('modified') || l.startsWith('updated');
    }).length;
  }

  get deleteCount(): number {
    return this.audits.filter(a => a.action?.toLowerCase().startsWith('deleted')).length;
  }

  formatAction(action: string): string {
    if (!action) return '';
    return action.replace(/\s+ID:\s*\S+/i, '').trim();
  }

  /**
   * Parse the rich action string into structured parts.
   * Format: 'Created Tour Package "Summer Trip"' or 'Updated Hotel "Grand Resort" → Name, Rating'
   */
  parseAction(action: string): { verb: string; entityType: string; entityName: string; changedFields: string } {
    if (!action) return { verb: '', entityType: '', entityName: '', changedFields: '' };

    // Strip legacy ID patterns first
    let cleaned = action.replace(/\s+ID:\s*\S+/i, '').trim();

    let verb = '';
    let rest = cleaned;

    // Extract the verb (Created, Updated, Deleted, Added, Modified)
    const verbMatch = cleaned.match(/^(Created|Updated|Deleted|Added|Modified)\s+/i);
    if (verbMatch) {
      verb = verbMatch[1];
      rest = cleaned.substring(verbMatch[0].length);
    }

    // Extract changed fields after arrow →
    let changedFields = '';
    const arrowIdx = rest.indexOf('→');
    if (arrowIdx !== -1) {
      changedFields = rest.substring(arrowIdx + 1).trim();
      rest = rest.substring(0, arrowIdx).trim();
    }

    // Extract entity name in quotes
    let entityName = '';
    const nameMatch = rest.match(/"([^"]+)"/);
    if (nameMatch) {
      entityName = nameMatch[1];
      rest = rest.replace(/"[^"]*"/, '').trim();
    }
    // Also handle legacy single-quoted names
    const legacyNameMatch = rest.match(/'([^']+)'/);
    if (!entityName && legacyNameMatch) {
      entityName = legacyNameMatch[1];
      rest = rest.replace(/'[^']*'/, '').trim();
    }

    const entityType = rest.trim();

    return { verb, entityType, entityName, changedFields };
  }

  getEntityIcon(entityType: string): string {
    if (!entityType) return 'info';
    const lower = entityType.toLowerCase();
    if (lower.includes('user') || lower.includes('account')) return 'person';
    if (lower.includes('role')) return 'admin_panel_settings';
    if (lower.includes('agent')) return 'support_agent';
    if (lower.includes('hotel')) return 'hotel';
    if (lower.includes('room')) return 'king_bed';
    if (lower.includes('tour package') || lower.includes('package')) return 'card_travel';
    if (lower.includes('activity')) return 'directions_run';
    if (lower.includes('transport')) return 'directions_car';
    if (lower.includes('meal') || lower.includes('restaurant') || lower.includes('menu') || lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner')) return 'restaurant';
    if (lower.includes('booking')) return 'book_online';
    if (lower.includes('payment')) return 'payments';
    if (lower.includes('refund')) return 'currency_exchange';
    if (lower.includes('review')) return 'rate_review';
    if (lower.includes('traveller')) return 'groups';
    if (lower.includes('division') || lower.includes('district') || lower.includes('location') || lower.includes('spot')) return 'place';
    if (lower.includes('budget')) return 'account_balance_wallet';
    if (lower.includes('picture') || lower.includes('image')) return 'photo_camera';
    if (lower.includes('guide')) return 'tour';
    if (lower.includes('custom tour')) return 'explore';
    if (lower.includes('tag')) return 'label';
    if (lower.includes('facilit')) return 'meeting_room';
    if (lower.includes('amenit')) return 'spa';
    return 'description';
  }

  getEntityColor(entityType: string): string {
    if (!entityType) return '#64748b';
    const lower = entityType.toLowerCase();
    if (lower.includes('user') || lower.includes('account') || lower.includes('role')) return '#6366f1';
    if (lower.includes('hotel') || lower.includes('room')) return '#0891b2';
    if (lower.includes('package')) return '#059669';
    if (lower.includes('activity') || lower.includes('transport')) return '#d97706';
    if (lower.includes('booking')) return '#7c3aed';
    if (lower.includes('payment') || lower.includes('refund')) return '#dc2626';
    if (lower.includes('restaurant') || lower.includes('meal') || lower.includes('menu')) return '#ea580c';
    if (lower.includes('division') || lower.includes('district') || lower.includes('location') || lower.includes('spot')) return '#0d9488';
    return '#475569';
  }
}
