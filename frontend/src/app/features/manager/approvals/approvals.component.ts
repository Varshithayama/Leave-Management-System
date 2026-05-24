import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container py-4">
    <h4 class="fw-bold mb-4">✅ Pending Approvals</h4>

    <div class="alert alert-success" *ngIf="success">{{ success }}</div>
    <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

    <div class="card shadow-sm mb-3" *ngFor="let r of requests">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-5">
            <h6 class="fw-bold mb-1">{{ r.employeeName }}
              <span class="badge bg-light text-dark fw-normal ms-1">{{ r.employeeCode }}</span>
            </h6>
            <small class="text-muted">{{ r.department }}</small><br>
            <span class="badge bg-secondary mt-1">{{ r.leaveTypeName }}</span>
          </div>
          <div class="col-md-4">
            <div class="small">
              <strong>📅 {{ r.fromDate | date:'dd MMM yyyy' }}</strong> →
              <strong>{{ r.toDate | date:'dd MMM yyyy' }}</strong>
            </div>
            <div class="text-muted small">{{ r.totalDays }} working day(s)</div>
            <div class="text-muted small mt-1">Reason: {{ r.reason }}</div>
            <div class="text-muted small">Applied: {{ r.appliedOn | date:'dd MMM yyyy' }}</div>
          </div>
          <div class="col-md-3">
            <input type="text" class="form-control form-control-sm mb-2"
                   [(ngModel)]="comments[r.id]" placeholder="Comment (optional)">
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-sm flex-grow-1" (click)="action(r, 'Approved')">
                ✓ Approve
              </button>
              <button class="btn btn-danger btn-sm flex-grow-1" (click)="action(r, 'Rejected')">
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer bg-light">
        <small class="text-muted">Request #{{ r.requestNumber }}</small>
      </div>
    </div>

    <div class="text-center py-5" *ngIf="requests.length === 0 && !loading">
      <div class="display-4">🎉</div>
      <p class="text-muted mt-2">No pending approvals. You're all caught up!</p>
    </div>

    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-primary"></div>
    </div>
  </div>`
})
export class ApprovalsComponent implements OnInit {
  requests: LeaveRequest[] = [];
  comments: Record<number, string> = {};
  loading = true;
  success = '';
  error = '';

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.leaveService.getPendingApprovals().subscribe({
      next: r => { this.requests = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  action(r: LeaveRequest, action: string): void {
    const msg = action === 'Approved' ? 'Approve' : 'Reject';
    if (!confirm(`${msg} leave for ${r.employeeName}?`)) return;
    this.success = '';
    this.error = '';
    this.leaveService.actionLeave(r.id, action, this.comments[r.id]).subscribe({
      next: () => {
        this.success = `Leave ${action.toLowerCase()} for ${r.employeeName}`;
        this.requests = this.requests.filter(x => x.id !== r.id);
      },
      error: (err) => this.error = err.error?.message ?? 'Action failed'
    });
  }
}
