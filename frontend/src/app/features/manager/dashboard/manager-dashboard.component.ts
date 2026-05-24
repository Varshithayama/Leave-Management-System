import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { ManagerDashboard } from '../../../shared/models/models';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container py-4" *ngIf="dashboard">
    <h4 class="fw-bold mb-4">👥 Team Dashboard</h4>

    <!-- KPIs -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body text-center">
            <h2 class="fw-bold">{{ dashboard.totalReportees }}</h2>
            <p class="mb-0">Team Members</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-warning text-dark">
          <div class="card-body text-center">
            <h2 class="fw-bold">{{ dashboard.pendingApprovals }}</h2>
            <p class="mb-0">Pending Approvals</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body text-center">
            <h2 class="fw-bold">{{ dashboard.teamCalendar.length }}</h2>
            <p class="mb-0">Upcoming Team Leaves</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending approvals -->
    <div class="card shadow-sm mb-4" *ngIf="dashboard.pendingApprovals > 0">
      <div class="card-header d-flex justify-content-between">
        <span class="fw-semibold">⏳ Awaiting Your Action</span>
        <a routerLink="/manager/approvals" class="btn btn-sm btn-warning">Review All</a>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Employee</th><th>Leave Type</th><th>Dates</th><th>Days</th><th>Applied</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of dashboard.pendingRequests">
              <td>{{ r.employeeName }}</td>
              <td><span class="badge bg-secondary">{{ r.leaveTypeCode }}</span></td>
              <td>{{ r.fromDate | date:'dd MMM' }} – {{ r.toDate | date:'dd MMM yy' }}</td>
              <td>{{ r.totalDays }}</td>
              <td>{{ r.appliedOn | date:'dd MMM' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Team calendar -->
    <div class="card shadow-sm">
      <div class="card-header fw-semibold">📅 Team Leave Calendar (Upcoming)</div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of dashboard.teamCalendar">
              <td>{{ t.employeeName }}</td>
              <td>{{ t.leaveType }}</td>
              <td>{{ t.fromDate | date:'dd MMM yyyy' }}</td>
              <td>{{ t.toDate | date:'dd MMM yyyy' }}</td>
              <td><span class="badge bg-success">{{ t.status }}</span></td>
            </tr>
            <tr *ngIf="dashboard.teamCalendar.length === 0">
              <td colspan="5" class="text-center text-muted py-3">No upcoming team leaves</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="text-center py-5" *ngIf="loading">
    <div class="spinner-border text-primary"></div>
  </div>`
})
export class ManagerDashboardComponent implements OnInit {
  dashboard: ManagerDashboard | null = null;
  loading = true;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveService.getManagerDashboard().subscribe({
      next: d => { this.dashboard = d; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
