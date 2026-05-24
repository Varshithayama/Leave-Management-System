import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container-fluid px-4">
      <a class="navbar-brand fw-bold" href="#">🏢 LeaveMgmt</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto">
          <ng-container *ngIf="auth.isEmployee || auth.isManager">
            <li class="nav-item"><a class="nav-link" routerLink="/employee/dashboard" routerLinkActive="active">🏠 Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/employee/apply" routerLinkActive="active">📝 Apply Leave</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/employee/my-leaves" routerLinkActive="active">📋 My Leaves</a></li>
          </ng-container>
          <ng-container *ngIf="auth.isManager">
            <li class="nav-item"><a class="nav-link" routerLink="/manager/dashboard" routerLinkActive="active">👥 Team Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/manager/team" routerLinkActive="active">🧑‍🤝‍🧑 My Team</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/manager/approvals" routerLinkActive="active">✅ Approvals</a></li>
          </ng-container>
          <ng-container *ngIf="auth.isHRAdmin">
            <li class="nav-item"><a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">📊 Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/admin/employees" routerLinkActive="active">👥 Employees</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/admin/all-leaves" routerLinkActive="active">📋 All Leaves</a></li>
          </ng-container>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown">
              <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">
                {{ initials }}
              </div>
              <span>{{ auth.user?.name }}</span>
              <span class="badge bg-light text-primary">{{ auth.role }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><span class="dropdown-item-text text-muted small">{{ auth.user?.email }}</span></li>
              <li><span class="dropdown-item-text text-muted small">{{ auth.user?.department }}</span></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" routerLink="/profile"><i class="bi bi-person-circle me-2"></i>My Profile & Password</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" (click)="logout()" style="cursor:pointer"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>`
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
  get initials(): string {
    return (this.auth.user?.name ?? 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }
  logout(): void { this.auth.logout(); }
}
