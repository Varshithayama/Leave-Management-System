import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">

        <!-- Profile Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white d-flex align-items-center gap-3">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;">
              {{ initials }}
            </div>
            <div>
              <h5 class="mb-0">{{ auth.user?.name }}</h5>
              <small>{{ auth.user?.role }} · {{ auth.user?.department }}</small>
            </div>
          </div>
          <div class="card-body">
            <table class="table table-sm table-borderless mb-0">
              <tr><td class="text-muted">Email</td><td>{{ auth.user?.email }}</td></tr>
              <tr><td class="text-muted">Role</td><td><span class="badge bg-primary">{{ auth.user?.role }}</span></td></tr>
              <tr><td class="text-muted">Department</td><td>{{ auth.user?.department }}</td></tr>
            </table>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="card shadow-sm">
          <div class="card-header fw-semibold">🔒 Change Password</div>
          <div class="card-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Current Password</label>
              <div class="input-group">
                <input [type]="show.current ? 'text' : 'password'"
                       class="form-control" [(ngModel)]="form.currentPassword">
                <button class="btn btn-outline-secondary" type="button"
                        (click)="show.current = !show.current">
                  <i [class]="'bi ' + (show.current ? 'bi-eye-slash' : 'bi-eye')"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">New Password</label>
              <div class="input-group">
                <input [type]="show.new ? 'text' : 'password'"
                       class="form-control" [(ngModel)]="form.newPassword">
                <button class="btn btn-outline-secondary" type="button"
                        (click)="show.new = !show.new">
                  <i [class]="'bi ' + (show.new ? 'bi-eye-slash' : 'bi-eye')"></i>
                </button>
              </div>
              <!-- Password strength indicator -->
              <div class="mt-2" *ngIf="form.newPassword">
                <div class="progress" style="height:5px">
                  <div class="progress-bar"
                       [class]="strengthClass"
                       [style.width.%]="strengthPct"></div>
                </div>
                <small [class]="'text-' + strengthColor">{{ strengthLabel }}</small>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Confirm New Password</label>
              <div class="input-group">
                <input [type]="show.confirm ? 'text' : 'password'"
                       class="form-control" [(ngModel)]="form.confirmPassword">
                <button class="btn btn-outline-secondary" type="button"
                        (click)="show.confirm = !show.confirm">
                  <i [class]="'bi ' + (show.confirm ? 'bi-eye-slash' : 'bi-eye')"></i>
                </button>
              </div>
              <small class="text-danger"
                     *ngIf="form.confirmPassword && form.newPassword !== form.confirmPassword">
                Passwords do not match
              </small>
            </div>

            <button class="btn btn-primary w-100" (click)="changePassword()" [disabled]="saving">
              <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>`
})
export class ProfileComponent {
  form = { currentPassword: '', newPassword: '', confirmPassword: '' };
  show = { current: false, new: false, confirm: false };
  saving = false;

  get initials(): string {
    return (this.auth.user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  get strengthPct(): number {
    const p = this.form.newPassword;
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }

  get strengthLabel(): string {
    const s = this.strengthPct;
    if (s <= 25) return 'Weak';
    if (s <= 50) return 'Fair';
    if (s <= 75) return 'Good';
    return 'Strong';
  }

  get strengthClass(): string {
    return `bg-${this.strengthColor}`;
  }

  get strengthColor(): string {
    const s = this.strengthPct;
    if (s <= 25) return 'danger';
    if (s <= 50) return 'warning';
    if (s <= 75) return 'info';
    return 'success';
  }

  constructor(public auth: AuthService, private http: HttpClient, private toast: ToastService) {}

  changePassword(): void {
    if (!this.form.currentPassword || !this.form.newPassword) {
      this.toast.warning('Please fill all fields'); return;
    }
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.toast.error('Passwords do not match'); return;
    }
    if (this.strengthPct < 50) {
      this.toast.warning('Please choose a stronger password'); return;
    }
    this.saving = true;
    this.http.put(`${environment.apiUrl}/users/change-password`, {
      currentPassword: this.form.currentPassword,
      newPassword: this.form.newPassword
    }).subscribe({
      next: () => {
        this.toast.success('Password updated successfully!');
        this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.saving = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to update password');
        this.saving = false;
      }
    });
  }
}
