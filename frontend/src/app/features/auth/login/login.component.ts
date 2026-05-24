import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow" style="width:420px">
      <div class="card-header bg-primary text-white text-center py-4">
        <h4 class="mb-0">🏢 Leave Management System</h4>
        <small>Sign in to your account</small>
      </div>
      <div class="card-body p-4">
        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Email Address</label>
          <input type="email" class="form-control" [(ngModel)]="email" placeholder="you@company.com">
        </div>
        <div class="mb-4">
          <label class="form-label fw-semibold">Password</label>
          <div class="input-group">
            <input [type]="showPassword ? 'text' : 'password'" class="form-control"
                   [(ngModel)]="password" (keyup.enter)="login()">
            <button class="btn btn-outline-secondary" type="button" (click)="showPassword = !showPassword"
                    [title]="showPassword ? 'Hide password' : 'Show password'">
              <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <button class="btn btn-primary w-100" (click)="login()" [disabled]="loading">
          <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        <hr>
        <div class="bg-light rounded p-3 small">
          <strong>Demo Credentials:</strong><br>
          👤 <b>HR Admin:</b> admin&#64;company.com<br>
          👤 <b>Manager:</b> ravi&#64;company.com<br>
          👤 <b>Employee:</b> priya&#64;company.com<br>
          🔑 Password: <b>Password&#64;123</b>
        </div>
      </div>
    </div>
  </div>`
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) { this.error = 'Please enter email and password'; return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user.role === 'HRAdmin') this.router.navigate(['/admin/dashboard']);
        else if (user.role === 'Manager') this.router.navigate(['/manager/dashboard']);
        else this.router.navigate(['/employee/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
