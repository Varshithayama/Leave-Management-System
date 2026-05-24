import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  employeeCode: string;
  department: string;
  joiningDate: string;
  currentStatus: string;
  balances: any[];
  recentLeaves: any[];
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-4">
    <h4 class="fw-bold mb-4">👥 My Team</h4>

    <!-- Summary bar -->
    <div class="row g-3 mb-4" *ngIf="team.length > 0">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-primary text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-0">{{ team.length }}</h2>
              <p class="mb-0 small">Total Team Members</p>
            </div>
            <i class="bi bi-people-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-success text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-0">{{ presentCount }}</h2>
              <p class="mb-0 small">Present Today</p>
            </div>
            <i class="bi bi-person-check-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm bg-warning text-dark">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h2 class="fw-bold mb-0">{{ onLeaveCount }}</h2>
              <p class="mb-0 small">On Leave Today</p>
            </div>
            <i class="bi bi-person-dash-fill display-5 opacity-50"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Team member cards -->
    <div class="row g-3" *ngIf="!loading">
      <div class="col-md-6" *ngFor="let member of team">
        <div class="card shadow-sm h-100" [ngClass]="member.currentStatus === 'On Leave' ? 'border-warning' : ''">

          <!-- Card header -->
          <div class="card-header d-flex justify-content-between align-items-center"
               [ngClass]="member.currentStatus === 'On Leave' ? 'bg-warning text-dark' : 'bg-light'">
            <div class="d-flex align-items-center gap-3">
              <!-- Avatar -->
              <div style="width:46px;height:46px;border-radius:50%;background:#0d6efd;
                          color:white;display:flex;align-items:center;justify-content:center;
                          font-size:16px;font-weight:700;">
                {{ getInitials(member.name) }}
              </div>
              <div>
                <div class="fw-bold">{{ member.name }}</div>
                <small class="text-muted">{{ member.employeeCode }} · {{ member.department }}</small>
              </div>
            </div>
            <!-- Status badge -->
            <span class="badge fs-6"
                  [ngClass]="member.currentStatus === 'On Leave' ? 'bg-dark' : 'bg-success'">
              <i class="bi me-1"
                 [ngClass]="member.currentStatus === 'On Leave' ? 'bi-moon-stars-fill' : 'bi-circle-fill'"></i>
              {{ member.currentStatus }}
            </span>
          </div>

          <div class="card-body">
            <!-- Contact info -->
            <div class="mb-3">
              <small class="text-muted"><i class="bi bi-envelope me-1"></i>{{ member.email }}</small><br>
              <small class="text-muted"><i class="bi bi-calendar me-1"></i>
                Joined {{ member.joiningDate | date:'dd MMM yyyy' }}
              </small>
            </div>

            <!-- Leave balances -->
            <div class="mb-3">
              <p class="fw-semibold small mb-2">📊 Leave Balances</p>
              <div class="row g-1">
                <div class="col-4" *ngFor="let b of member.balances">
                  <div class="text-center p-2 rounded"
                       style="background:#f8f9fa;border:1px solid #dee2e6">
                    <div class="fw-bold text-primary">{{ b.availableDays }}</div>
                    <small class="text-muted d-block" style="font-size:10px">{{ b.code }}</small>
                    <small class="text-muted" style="font-size:10px">available</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent leaves -->
            <div *ngIf="member.recentLeaves.length > 0">
              <p class="fw-semibold small mb-2">📋 Recent Leaves</p>
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-content-between align-items-center
                            p-2 rounded" style="background:#f8f9fa"
                     *ngFor="let l of member.recentLeaves">
                  <div>
                    <span class="badge bg-secondary me-1">{{ l.leaveType }}</span>
                    <small class="text-muted">
                      {{ l.fromDate | date:'dd MMM' }} – {{ l.toDate | date:'dd MMM yy' }}
                    </small>
                  </div>
                  <div class="d-flex align-items-center gap-1">
                    <small class="text-muted">{{ l.totalDays }}d</small>
                    <span class="badge"
                          [ngClass]="statusClass(l.status)">{{ l.status }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="member.recentLeaves.length === 0">
              <small class="text-muted">No leave history yet</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div class="text-center py-5" *ngIf="!loading && team.length === 0">
      <i class="bi bi-people display-3 text-muted"></i>
      <p class="text-muted mt-3">No team members assigned to you yet.</p>
      <small class="text-muted">Ask HR Admin to assign employees under your management.</small>
    </div>

    <!-- Loading -->
    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Loading team...</p>
    </div>
  </div>`
})
export class TeamComponent implements OnInit {
  team: TeamMember[] = [];
  loading = true;

  get presentCount(): number {
    return this.team.filter(m => m.currentStatus === 'Present').length;
  }
  get onLeaveCount(): number {
    return this.team.filter(m => m.currentStatus === 'On Leave').length;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<TeamMember[]>(`${environment.apiUrl}/leaves/team`).subscribe({
      next: t => { this.team = t; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-warning text-dark',
      Approved: 'bg-success',
      Rejected: 'bg-danger',
      Cancelled: 'bg-secondary'
    };
    return map[status] ?? 'bg-secondary';
  }
}
