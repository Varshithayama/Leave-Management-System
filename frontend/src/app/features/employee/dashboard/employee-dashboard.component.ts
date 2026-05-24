import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeDashboard } from '../../../shared/models/models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4" *ngIf="dashboard">
    <!-- Welcome -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-0">👋 Welcome, {{ dashboard.employeeName }}</h4>
        <small class="text-muted">{{ dashboard.department }} &bull; Manager: {{ dashboard.managerName }}</small>
      </div>
      <a routerLink="/employee/apply" class="btn btn-primary">
        <i class="bi bi-plus-circle me-1"></i> Apply Leave
      </a>
    </div>

    <!-- Leave Balance Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4" *ngFor="let b of dashboard.balances">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-1">{{ b.leaveTypeName }}</p>
                <h3 class="fw-bold text-primary mb-0">{{ b.availableDays }}</h3>
                <small class="text-muted">days available</small>
              </div>
              <span class="badge bg-primary rounded-pill fs-6">{{ b.code }}</span>
            </div>
            <div class="mt-3">
              <div class="d-flex justify-content-between small text-muted mb-1">
                <span>Used: {{ b.usedDays }}</span>
                <span>Pending: {{ b.pendingDays }}</span>
                <span>Total: {{ b.totalDays }}</span>
              </div>
              <div class="progress" style="height:6px">
                <div class="progress-bar bg-primary" [style.width.%]="(b.usedDays / b.totalDays) * 100"></div>
                <div class="progress-bar bg-warning" [style.width.%]="(b.pendingDays / b.totalDays) * 100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- Recent Requests -->
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between">
            <span class="fw-semibold">Recent Leave Requests</span>
            <a routerLink="/employee/my-leaves" class="small">View all →</a>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr><th>Request #</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of dashboard.recentRequests">
                    <td><small class="text-muted">{{ r.requestNumber }}</small></td>
                    <td><span class="badge bg-secondary">{{ r.leaveTypeCode }}</span></td>
                    <td><small>{{ r.fromDate | date:'dd MMM' }} – {{ r.toDate | date:'dd MMM yy' }}</small></td>
                    <td>{{ r.totalDays }}</td>
                    <td><span class="badge" [ngClass]="statusClass(r.status)">{{ r.status }}</span></td>
                  </tr>
                  <tr *ngIf="dashboard.recentRequests.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">No leave requests yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Holidays -->
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-header fw-semibold">🎉 Upcoming Holidays</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between" *ngFor="let h of dashboard.upcomingHolidays">
              <span>{{ h.name }}</span>
              <small class="text-muted">{{ h.date | date:'dd MMM' }}</small>
            </li>
            <li class="list-group-item text-muted text-center" *ngIf="dashboard.upcomingHolidays.length === 0">
              No upcoming holidays
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="text-center py-5" *ngIf="loading">
    <div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Loading dashboard...</p>
  </div>`
})
export class EmployeeDashboardComponent implements OnInit {
  dashboard: EmployeeDashboard | null = null;
  loading = true;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveService.getEmployeeDashboard().subscribe({
      next: d => { this.dashboard = d; this.loading = false; },
      error: () => this.loading = false
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
