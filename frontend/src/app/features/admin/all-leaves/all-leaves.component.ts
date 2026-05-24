import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-all-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container-fluid py-4 px-4">
    <h4 class="fw-bold mb-4">📋 All Leave Requests</h4>

    <!-- Filter bar -->
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="applyFilter()">
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Cancelled</option>
        </select>
      </div>
      <div class="col-md-3">
        <input type="text" class="form-control form-control-sm"
               placeholder="Search employee name..."
               [(ngModel)]="filterName" (ngModelChange)="applyFilter()">
      </div>
      <div class="col-md-2">
        <span class="badge bg-secondary fs-6 mt-1">{{ filtered.length }} records</span>
      </div>
    </div>

    <!-- Manager Pending Leaves Alert -->
    <div class="alert alert-warning d-flex align-items-center mb-3" *ngIf="managerPendingLeaves.length > 0">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <strong>{{ managerPendingLeaves.length }} Manager leave(s) pending your approval</strong>
      <button class="btn btn-sm btn-warning ms-auto" (click)="showManagerLeaves = !showManagerLeaves">
        {{ showManagerLeaves ? 'Hide' : 'Review' }}
      </button>
    </div>

    <!-- Manager Leaves Approval Panel -->
    <div class="card shadow-sm mb-4 border-warning" *ngIf="showManagerLeaves && managerPendingLeaves.length > 0">
      <div class="card-header bg-warning text-dark fw-semibold">
        ⚠️ Manager Leave Requests — Requires Your Approval
      </div>
      <div class="card-body p-0">
        <div class="p-3 border-bottom" *ngFor="let r of managerPendingLeaves">
          <div class="row align-items-center">
            <div class="col-md-5">
              <h6 class="fw-bold mb-0">{{ r.employeeName }}
                <span class="badge bg-primary ms-1">Manager</span>
              </h6>
              <small class="text-muted">{{ r.department }} · {{ r.leaveTypeName }}</small>
            </div>
            <div class="col-md-4">
              <div class="small"><strong>{{ r.fromDate | date:'dd MMM' }} → {{ r.toDate | date:'dd MMM yyyy' }}</strong></div>
              <div class="text-muted small">{{ r.totalDays }} day(s) · Reason: {{ r.reason }}</div>
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control form-control-sm mb-1"
                     [(ngModel)]="comments[r.id]" placeholder="Comment (optional)">
              <div class="d-flex gap-1">
                <button class="btn btn-success btn-sm flex-grow-1" (click)="action(r, 'Approved')">✓ Approve</button>
                <button class="btn btn-danger btn-sm flex-grow-1" (click)="action(r, 'Rejected')">✗ Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All leaves table -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Request #</th><th>Employee</th><th>Role</th><th>Dept</th>
                <th>Type</th><th>From</th><th>To</th><th>Days</th>
                <th>Applied</th><th>Status</th><th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filtered">
                <td><small class="text-muted">{{ r.requestNumber }}</small></td>
                <td><strong>{{ r.employeeName }}</strong><br>
                  <small class="text-muted">{{ r.employeeCode }}</small></td>
                <td>{{ r.department }}</td>
                <td>{{ r.department }}</td>
                <td><span class="badge bg-secondary">{{ r.leaveTypeCode }}</span></td>
                <td><small>{{ r.fromDate | date:'dd MMM yyyy' }}</small></td>
                <td><small>{{ r.toDate | date:'dd MMM yyyy' }}</small></td>
                <td><strong>{{ r.totalDays }}</strong></td>
                <td><small>{{ r.appliedOn | date:'dd MMM yyyy' }}</small></td>
                <td>
                  <span class="badge" [ngClass]="statusClass(r.status)">{{ r.status }}</span>
                  <div class="text-muted small" *ngIf="r.managerComment">{{ r.managerComment }}</div>
                </td>
                <td><small>{{ r.approvedByManager || '—' }}</small></td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td colspan="11" class="text-center text-muted py-4">No records found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`
})
export class AllLeavesComponent implements OnInit {
  allLeaves: LeaveRequest[] = [];
  managerPendingLeaves: LeaveRequest[] = [];
  filtered: LeaveRequest[] = [];
  filterStatus = '';
  filterName = '';
  showManagerLeaves = true;
  comments: Record<number, string> = {};

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveService.getAllLeaves().subscribe(l => {
      this.allLeaves = l;
      this.applyFilter();
    });
    this.leaveService.getPendingManagerLeaves().subscribe(l => {
      this.managerPendingLeaves = l;
    });
  }

  applyFilter(): void {
    this.filtered = this.allLeaves.filter(l => {
      const statusMatch = !this.filterStatus || l.status === this.filterStatus;
      const nameMatch = !this.filterName || l.employeeName.toLowerCase().includes(this.filterName.toLowerCase());
      return statusMatch && nameMatch;
    });
  }

  action(r: LeaveRequest, action: string): void {
    if (!confirm(`${action === 'Approved' ? 'Approve' : 'Reject'} leave for ${r.employeeName}?`)) return;
    this.leaveService.actionLeave(r.id, action, this.comments[r.id]).subscribe({
      next: () => {
        this.managerPendingLeaves = this.managerPendingLeaves.filter(x => x.id !== r.id);
        // Refresh all leaves list
        this.leaveService.getAllLeaves().subscribe(l => { this.allLeaves = l; this.applyFilter(); });
      },
      error: (err) => alert(err.error?.message ?? 'Action failed')
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark', Approved: 'bg-success',
      Rejected: 'bg-danger', Cancelled: 'bg-secondary'
    };
    return map[status] ?? 'bg-secondary';
  }
}
