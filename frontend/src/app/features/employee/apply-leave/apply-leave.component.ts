import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LeaveType, LeaveBalance } from '../../../shared/models/models';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-7">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📝 Apply for Leave</h5>
          </div>
          <div class="card-body p-4">

            <div class="mb-3">
              <label class="form-label fw-semibold">Leave Type *</label>
              <select class="form-select" [(ngModel)]="form.leaveTypeId" (change)="onTypeChange()">
                <option [value]="0">Select leave type</option>
                <option *ngFor="let t of leaveTypes" [value]="t.id">
                  {{ t.name }} ({{ t.code }})
                </option>
              </select>
            </div>

            <!-- Balance pill -->
            <div class="d-flex gap-2 mb-3 flex-wrap" *ngIf="selectedBalance">
              <span class="badge rounded-pill bg-success fs-6">✅ Available: {{ selectedBalance.availableDays }} days</span>
              <span class="badge rounded-pill bg-warning text-dark fs-6">⏳ Pending: {{ selectedBalance.pendingDays }} days</span>
              <span class="badge rounded-pill bg-secondary fs-6">📅 Used: {{ selectedBalance.usedDays }} days</span>
            </div>

            <!-- Half day toggle -->
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="halfDay"
                     [(ngModel)]="form.isHalfDay" (change)="onHalfDayChange()">
              <label class="form-check-label fw-semibold" for="halfDay">
                Half Day Leave <span class="badge bg-info ms-1">0.5 day deducted</span>
              </label>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">From Date *</label>
                <input type="date" class="form-control" [(ngModel)]="form.fromDate"
                       [min]="today" (change)="onDateChange()">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">To Date *</label>
                <input type="date" class="form-control" [(ngModel)]="form.toDate"
                       [min]="form.fromDate || today"
                       [disabled]="form.isHalfDay"
                       (change)="onDateChange()">
              </div>
            </div>

            <!-- Working days preview -->
            <div class="alert alert-info py-2 mb-3" *ngIf="previewDays > 0">
              📊 Estimated: <strong>{{ previewDays }} working day(s)</strong> will be deducted
              <span class="text-danger ms-2" *ngIf="selectedBalance && previewDays > selectedBalance.availableDays">
                ⚠️ Exceeds available balance!
              </span>
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Reason *</label>
              <textarea class="form-control" rows="3" [(ngModel)]="form.reason"
                        placeholder="Brief reason for leave..." maxlength="500"></textarea>
              <small class="text-muted">{{ form.reason.length }}/500</small>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary flex-grow-1" (click)="submit()" [disabled]="submitting">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Submitting...' : 'Submit Application' }}
              </button>
              <a routerLink="/employee/my-leaves" class="btn btn-outline-secondary">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`
})
export class ApplyLeaveComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  balances: LeaveBalance[] = [];
  selectedBalance: LeaveBalance | null = null;
  today = new Date().toISOString().split('T')[0];
  form = { leaveTypeId: 0, fromDate: '', toDate: '', reason: '', isHalfDay: false };
  previewDays = 0;
  submitting = false;

  constructor(
    private leaveService: LeaveService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.leaveService.getLeaveTypes().subscribe(t => this.leaveTypes = t);
    this.leaveService.getBalances().subscribe(b => this.balances = b);
  }

  onTypeChange(): void {
    this.selectedBalance = this.balances.find(b => b.leaveTypeId === +this.form.leaveTypeId) ?? null;
  }

  onHalfDayChange(): void {
    if (this.form.isHalfDay) {
      this.form.toDate = this.form.fromDate;
      this.previewDays = 0.5;
    } else {
      this.onDateChange();
    }
  }

  onDateChange(): void {
    if (!this.form.fromDate || !this.form.toDate || this.form.isHalfDay) return;
    let days = 0;
    const from = new Date(this.form.fromDate);
    const to = new Date(this.form.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days++;
    }
    this.previewDays = days;
  }

  submit(): void {
    if (!this.form.leaveTypeId || !this.form.fromDate || !this.form.reason.trim()) {
      this.toast.warning('Please fill all required fields'); return;
    }
    if (!this.form.isHalfDay && !this.form.toDate) {
      this.toast.warning('Please select a To Date'); return;
    }
    this.submitting = true;
    this.leaveService.applyLeave({
      leaveTypeId: +this.form.leaveTypeId,
      fromDate: this.form.fromDate,
      toDate: this.form.isHalfDay ? this.form.fromDate : this.form.toDate,
      reason: this.form.reason,
      isHalfDay: this.form.isHalfDay
    }).subscribe({
      next: () => {
        this.toast.success('Leave application submitted successfully!');
        setTimeout(() => this.router.navigate(['/employee/my-leaves']), 1000);
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to submit. Please try again.');
        this.submitting = false;
      }
    });
  }
}
