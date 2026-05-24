import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { EmployeeDashboardComponent } from './features/employee/dashboard/employee-dashboard.component';
import { ApplyLeaveComponent } from './features/employee/apply-leave/apply-leave.component';
import { MyLeavesComponent } from './features/employee/my-leaves/my-leaves.component';
import { ManagerDashboardComponent } from './features/manager/dashboard/manager-dashboard.component';
import { ApprovalsComponent } from './features/manager/approvals/approvals.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AllLeavesComponent } from './features/admin/all-leaves/all-leaves.component';
import { EmployeesComponent } from './features/admin/employees/employees.component';

import { TeamComponent } from './features/manager/team/team.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: 'employee/dashboard', component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
  { path: 'employee/apply',     component: ApplyLeaveComponent,         canActivate: [AuthGuard] },
  { path: 'employee/my-leaves', component: MyLeavesComponent,           canActivate: [AuthGuard] },

  { path: 'manager/dashboard',  component: ManagerDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Manager','HRAdmin'] } },
  { path: 'manager/approvals',  component: ApprovalsComponent,        canActivate: [AuthGuard], data: { roles: ['Manager','HRAdmin'] } },
  { path: 'manager/team',       component: TeamComponent,             canActivate: [AuthGuard], data: { roles: ['Manager','HRAdmin'] } },

  { path: 'admin/dashboard',    component: AdminDashboardComponent, canActivate: [AuthGuard], data: { roles: ['HRAdmin'] } },
  { path: 'admin/all-leaves',   component: AllLeavesComponent,      canActivate: [AuthGuard], data: { roles: ['HRAdmin'] } },
  { path: 'admin/employees',    component: EmployeesComponent,      canActivate: [AuthGuard], data: { roles: ['HRAdmin'] } },

  { path: '**', redirectTo: 'login' }
];
