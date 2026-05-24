import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../shared/services/toast.service';
import { User, AddEmployeeResponse } from '../../../shared/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container-fluid py-4 px-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold mb-0">👥 Employee Management</h4>
      <button class="btn btn-primary" (click)="showForm = !showForm">
        <i class="bi bi-plus-circle me-1"></i> Add New Employee
      </button>
    </div>

    <!-- Add Employee Form -->
    <div class="card shadow-sm mb-4 border-primary" *ngIf="showForm">
      <div class="card-header bg-primary text-white fw-semibold">➕ Add New Employee</div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Full Name *</label>
            <input class="form-control" [(ngModel)]="newEmp.name" placeholder="e.g. Aisha Sharma">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Email *</label>
            <input type="email" class="form-control" [(ngModel)]="newEmp.email" placeholder="aisha@company.com">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Employee Code *</label>
            <input class="form-control" [(ngModel)]="newEmp.employeeCode" placeholder="e.g. EMP005">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Department *</label>
            <select class="form-select" [(ngModel)]="newEmp.department">
              <option value="">Select department</option>
              <option>Engineering</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>Operations</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Role *</label>
            <select class="form-select" [(ngModel)]="newEmp.role">
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Reports To (Manager)</label>
            <select class="form-select" [(ngModel)]="newEmp.managerId">
              <option [value]="null">No Manager</option>
              <option *ngFor="let m of managers" [value]="m.id">{{ m.name }} ({{ m.department }})</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Joining Date *</label>
            <input type="date" class="form-control" [(ngModel)]="newEmp.joiningDate">
          </div>
        </div>

        <div class="alert alert-info mt-3 mb-0">
          <i class="bi bi-info-circle me-2"></i>
          A temporary password will be auto-generated as <strong>Emp&#64;EmployeeCode</strong>
          (e.g. Emp&#64;EMP005). Leave balances will be assigned automatically.
        </div>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" (click)="addEmployee()" [disabled]="saving">
            <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Adding...' : 'Add Employee' }}
          </button>
          <button class="btn btn-outline-secondary" (click)="showForm = false; newEmployee = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Success card after adding -->
    <div class="card border-success shadow-sm mb-4" *ngIf="newEmployee">
      <div class="card-header bg-success text-white fw-semibold">✅ Employee Added Successfully!</div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <table class="table table-sm table-borderless mb-0">
              <tr><td class="text-muted">Name</td><td><strong>{{ newEmployee.name }}</strong></td></tr>
              <tr><td class="text-muted">Email</td><td>{{ newEmployee.email }}</td></tr>
              <tr><td class="text-muted">Employee Code</td><td>{{ newEmployee.employeeCode }}</td></tr>
              <tr><td class="text-muted">Role</td><td><span class="badge bg-primary">{{ newEmployee.role }}</span></td></tr>
            </table>
          </div>
          <div class="col-md-6">
            <div class="alert alert-warning mb-0">
              <strong>🔑 Temporary Password:</strong>
              <div class="fs-5 fw-bold mt-1 font-monospace">{{ newEmployee.tempPassword }}</div>
              <small>Share this with the employee. Ask them to change it on first login.</small>
            </div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-success mt-2" (click)="newEmployee = null">Dismiss</button>
      </div>
    </div>

    <!-- Employees Table -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">All Employees ({{ employees.length }})</span>
        <input type="text" class="form-control form-control-sm w-25"
               placeholder="Search name..." [(ngModel)]="search">
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Name</th><th>Code</th><th>Department</th><th>Role</th><th>Manager</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of filtered()">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div style="width:36px;height:36px;border-radius:50%;background:#0d6efd;color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;">
                    {{ getInitials(e.name) }}
                  </div>
                  <div>
                    <div class="fw-semibold">{{ e.name }}</div>
                    <small class="text-muted">{{ e.email }}</small>
                  </div>
                </div>
              </td>
              <td><span class="badge bg-light text-dark">{{ e.employeeCode }}</span></td>
              <td>{{ e.department }}</td>
              <td><span class="badge" [ngClass]="getRoleBadge(e.role)">{{ e.role }}</span></td>
              <td>{{ e.managerName || '—' }}</td>
              <td><small>{{ e.joiningDate | date:'dd MMM yyyy' }}</small></td>
              <td>
                <span class="badge" [ngClass]="e.isActive ? 'bg-success' : 'bg-secondary'">
                  {{ e.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm" [ngClass]="e.isActive ? 'btn-outline-warning' : 'btn-outline-success'"
                          (click)="toggleStatus(e)" [title]="e.isActive ? 'Deactivate' : 'Activate'">
                    <i class="bi" [ngClass]="e.isActive ? 'bi-pause-circle' : 'bi-play-circle'"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" (click)="resetPassword(e)" title="Reset Password">
                    <i class="bi bi-key"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`
})
export class EmployeesComponent implements OnInit {
  employees: User[] = [];
  managers: any[] = [];
  search = '';
  showForm = false;
  saving = false;
  newEmployee: AddEmployeeResponse | null = null;

  newEmp = {
    name: '', email: '', employeeCode: '', department: '',
    role: 'Employee', managerId: null as number | null,
    joiningDate: new Date().toISOString().split('T')[0]
  };

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.http.get<any[]>(`${environment.apiUrl}/users/managers`).subscribe(m => this.managers = m);
  }

  loadEmployees(): void {
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe(e => this.employees = e);
  }

  filtered(): User[] {
    if (!this.search) return this.employees;
    return this.employees.filter(e => e.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  addEmployee(): void {
    if (!this.newEmp.name || !this.newEmp.email || !this.newEmp.employeeCode || !this.newEmp.department) {
      this.toast.warning('Please fill all required fields'); return;
    }
    this.saving = true;
    this.http.post<AddEmployeeResponse>(`${environment.apiUrl}/users`, this.newEmp).subscribe({
      next: (res) => {
        this.newEmployee = res;
        this.toast.success(`${res.name} added successfully!`);
        this.showForm = false;
        this.saving = false;
        this.newEmp = { name: '', email: '', employeeCode: '', department: '', role: 'Employee', managerId: null, joiningDate: new Date().toISOString().split('T')[0] };
        this.loadEmployees();
      },
      error: (err) => { this.toast.error(err.error?.message ?? 'Failed to add employee'); this.saving = false; }
    });
  }

  toggleStatus(e: User): void {
    const msg = e.isActive ? 'Deactivate' : 'Activate';
    if (!confirm(`${msg} ${e.name}?`)) return;
    this.http.put<any>(`${environment.apiUrl}/users/${e.id}/toggle-status`, {}).subscribe({
      next: (res) => { e.isActive = res.isActive; this.toast.success(res.message); },
      error: () => this.toast.error('Action failed')
    });
  }

  resetPassword(e: User): void {
    if (!confirm(`Reset password for ${e.name}? Temp password will be Emp@${e.employeeCode}`)) return;
    this.http.put<any>(`${environment.apiUrl}/users/${e.id}/reset-password`, {}).subscribe({
      next: (res) => this.toast.success(`Password reset. Temp: ${res.tempPassword}`),
      error: () => this.toast.error('Reset failed')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  getRoleBadge(role: string): string {
    if (role === 'Manager') return 'bg-warning text-dark';
    if (role === 'HRAdmin') return 'bg-danger';
    return 'bg-primary';
  }
}
