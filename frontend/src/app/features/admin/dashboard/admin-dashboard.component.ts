import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { HRDashboard } from '../../../shared/models/models';

declare var Chart: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="container-fluid py-4 px-4" *ngIf="dashboard">
    <h4 class="fw-bold mb-4">🏢 HR Admin Dashboard</h4>

    <!-- KPI Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div><h2 class="fw-bold mb-0">{{ dashboard.totalEmployees }}</h2><p class="mb-0 small">Total Employees</p></div>
            <i class="bi bi-people-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div><h2 class="fw-bold mb-0">{{ dashboard.pendingRequests }}</h2><p class="mb-0 small">Pending Requests</p></div>
            <i class="bi bi-hourglass-split display-5 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div><h2 class="fw-bold mb-0">{{ dashboard.approvedThisMonth }}</h2><p class="mb-0 small">Approved This Month</p></div>
            <i class="bi bi-check-circle-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div><h2 class="fw-bold mb-0">{{ dashboard.rejectedThisMonth }}</h2><p class="mb-0 small">Rejected This Month</p></div>
            <i class="bi bi-x-circle-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-3 mb-4">
      <div class="col-md-8">
        <div class="card shadow-sm h-100">
          <div class="card-header fw-semibold">📊 Monthly Leave Trends (Last 6 Months)</div>
          <div class="card-body"><canvas id="monthlyChart" height="120"></canvas></div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-header fw-semibold">🍩 Leave Status Breakdown</div>
          <div class="card-body d-flex align-items-center justify-content-center">
            <canvas id="statusChart" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Department Stats -->
    <div class="card shadow-sm mb-4">
      <div class="card-header fw-semibold">🏬 Department-wise Leave Stats</div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Department</th><th>Total</th><th>Approved</th><th>Rejected</th><th>Pending</th><th>Approval Rate</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of dashboard.departmentStats">
              <td><strong>{{ d.department }}</strong></td>
              <td>{{ d.totalRequests }}</td>
              <td><span class="text-success fw-bold">{{ d.approved }}</span></td>
              <td><span class="text-danger fw-bold">{{ d.rejected }}</span></td>
              <td><span class="text-warning fw-bold">{{ d.pending }}</span></td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height:6px">
                    <div class="progress-bar bg-success"
                         [style.width.%]="d.totalRequests > 0 ? (d.approved/d.totalRequests)*100 : 0"></div>
                  </div>
                  <small>{{ d.totalRequests > 0 ? ((d.approved/d.totalRequests)*100).toFixed(0) : 0 }}%</small>
                </div>
              </td>
            </tr>
            <tr *ngIf="dashboard.departmentStats.length === 0">
              <td colspan="6" class="text-center text-muted py-3">No data yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pending Requests -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between">
        <span class="fw-semibold">⏳ All Pending Requests</span>
        <a routerLink="/admin/all-leaves" class="btn btn-sm btn-outline-primary">View All Leaves</a>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Employee</th><th>Dept</th><th>Type</th><th>Dates</th><th>Days</th><th>Applied</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of dashboard.allPendingRequests">
              <td>{{ r.employeeName }} <small class="text-muted">({{ r.employeeCode }})</small></td>
              <td>{{ r.department }}</td>
              <td><span class="badge bg-secondary">{{ r.leaveTypeCode }}</span></td>
              <td>{{ r.fromDate | date:'dd MMM' }} – {{ r.toDate | date:'dd MMM yy' }}</td>
              <td>{{ r.totalDays }}<span class="badge bg-info ms-1" *ngIf="r.isHalfDay">½</span></td>
              <td>{{ r.appliedOn | date:'dd MMM yyyy' }}</td>
            </tr>
            <tr *ngIf="dashboard.allPendingRequests.length === 0">
              <td colspan="6" class="text-center text-muted py-3">🎉 No pending requests!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="text-center py-5" *ngIf="loading">
    <div class="spinner-border text-primary"></div><p class="mt-2 text-muted">Loading dashboard...</p>
  </div>`
})
export class AdminDashboardComponent implements OnInit {
  dashboard: HRDashboard | null = null;
  loading = true;

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveService.getHRDashboard().subscribe({
      next: d => {
        this.dashboard = d;
        this.loading = false;
        setTimeout(() => this.renderCharts(), 200);
      },
      error: () => this.loading = false
    });
  }

  renderCharts(): void {
    if (!this.dashboard) return;

    const totalLeaves = this.dashboard.monthlyStats.reduce((s, m) => s + m.total, 0);
    const maxMonthly = Math.max(...this.dashboard.monthlyStats.map(m => m.total), 1);
    const yMax = Math.ceil((maxMonthly + 2) / 5) * 5; // round up to nearest 5, min headroom

    // Monthly bar chart
    const monthlyCtx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (monthlyCtx) {
      new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: this.dashboard.monthlyStats.length > 0
            ? this.dashboard.monthlyStats.map(m => m.month)
            : ['No data yet'],
          datasets: [
            {
              label: 'Approved',
              data: this.dashboard.monthlyStats.map(m => m.approved),
              backgroundColor: '#198754',
              borderRadius: 4
            },
            {
              label: 'Rejected',
              data: this.dashboard.monthlyStats.map(m => m.rejected),
              backgroundColor: '#dc3545',
              borderRadius: 4
            },
            {
              label: 'Pending',
              data: this.dashboard.monthlyStats.map(m => m.pending),
              backgroundColor: '#ffc107',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                footer: (items: any) => {
                  const total = items.reduce((s: number, i: any) => s + i.parsed.y, 0);
                  return `Total: ${total}`;
                }
              }
            }
          },
          scales: {
            x: { stacked: true },
            y: {
              stacked: true,
              beginAtZero: true,
              max: yMax,
              ticks: {
                stepSize: 1,
                precision: 0    // whole numbers only
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          }
        }
      });
    }

    // Status donut chart
    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (statusCtx) {
      const approved = this.dashboard.departmentStats.reduce((s, d) => s + d.approved, 0);
      const rejected = this.dashboard.departmentStats.reduce((s, d) => s + d.rejected, 0);
      const pending  = this.dashboard.departmentStats.reduce((s, d) => s + d.pending, 0);
      const hasData  = approved + rejected + pending > 0;

      new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Rejected', 'Pending'],
          datasets: [{
            data: hasData ? [approved, rejected, pending] : [1, 1, 1],
            backgroundColor: hasData
              ? ['#198754', '#dc3545', '#ffc107']
              : ['#e9ecef', '#e9ecef', '#e9ecef'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (item: any) => {
                  if (!hasData) return ' No data yet';
                  const total = approved + rejected + pending;
                  const pct = ((item.parsed / total) * 100).toFixed(1);
                  return ` ${item.label}: ${item.parsed} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  }
}