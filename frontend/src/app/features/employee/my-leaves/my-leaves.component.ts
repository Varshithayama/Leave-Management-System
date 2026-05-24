import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LeaveRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">📋 My Leave Requests</h4>
      <a routerLink="/employee/apply" class="btn btn-primary btn-sm">+ Apply Leave</a>
    </div>

    <!-- Filter tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" *ngFor="let tab of tabs">
        <a class="nav-link" [class.active]="activeTab === tab" (click)="activeTab = tab" style="cursor:pointer">
          {{ tab }}
          <span class="badge bg-secondary ms-1">{{ count(tab) }}</span>
        </a>
      </li>
    </ul>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Request #</th><th>Leave Type</th><th>From</th>
                <th>To</th><th>Days</th><th>Applied On</th>
                <th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filtered()">
                <td><small class="text-muted">{{ r.requestNumber }}</small></td>
                <td><span class="badge bg-secondary">{{ r.leaveTypeCode }}</span> {{ r.leaveTypeName }}</td>
                <td>{{ r.fromDate | date:'dd MMM yyyy' }}</td>
                <td>{{ r.toDate | date:'dd MMM yyyy' }}</td>
                <td><strong>{{ r.totalDays }}</strong></td>
                <td><small>{{ r.appliedOn | date:'dd MMM yyyy' }}</small></td>
                <td><span class="badge" [ngClass]="statusClass(r.status)">{{ r.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-danger"
                          *ngIf="r.status === 'Pending'"
                          (click)="cancel(r)">Cancel</button>
                  <span class="text-muted small" *ngIf="r.status !== 'Pending'">
                    {{ r.managerComment || '—' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filtered().length === 0">
                <td colspan="8" class="text-center text-muted py-4">No {{ activeTab.toLowerCase() }} requests</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`
})
export class MyLeavesComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
  activeTab = 'All';

  constructor(private leaveService: LeaveService, private toast: ToastService) {}

  ngOnInit(): void {
    this.leaveService.getMyLeaves().subscribe(l => this.leaves = l);
  }

  filtered(): LeaveRequest[] {
    return this.activeTab === 'All' ? this.leaves : this.leaves.filter(l => l.status === this.activeTab);
  }

  count(tab: string): number {
    return tab === 'All' ? this.leaves.length : this.leaves.filter(l => l.status === tab).length;
  }

  cancel(r: LeaveRequest): void {
    if (!confirm('Cancel this leave request?')) return;
    this.leaveService.actionLeave(r.id, 'Cancelled', 'Cancelled by employee').subscribe({
      next: () => { r.status = 'Cancelled'; this.toast.success('Leave request cancelled successfully'); },
      error: (err) => this.toast.error(err.error?.message ?? 'Failed to cancel')
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
