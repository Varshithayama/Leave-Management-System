export interface AuthResponse {
  token: string; userId: number; name: string;
  email: string; role: string; department: string;
}
export interface User {
  id: number; name: string; email: string; role: string;
  department: string; employeeCode: string; joiningDate: string;
  managerId?: number; managerName?: string; isActive: boolean;
}
export interface LeaveType {
  id: number; name: string; code: string; defaultDays: number; carryForward: boolean;
}
export interface LeaveBalance {
  leaveTypeId: number; leaveTypeName: string; code: string;
  totalDays: number; usedDays: number; pendingDays: number; availableDays: number;
}
export interface LeaveRequest {
  id: number; requestNumber: string; employeeName: string; employeeCode: string;
  department: string; leaveTypeName: string; leaveTypeCode: string;
  fromDate: string; toDate: string; totalDays: number; reason: string;
  status: string; managerComment?: string; approvedByManager?: string;
  actionDate?: string; appliedOn: string; isHalfDay: boolean; auditLogs: AuditLog[];
}
export interface AuditLog {
  action: string; performedBy: string; comment?: string; timestamp: string;
}
export interface EmployeeDashboard {
  employeeName: string; department: string; managerName: string;
  balances: LeaveBalance[]; recentRequests: LeaveRequest[]; upcomingHolidays: Holiday[];
}
export interface ManagerDashboard {
  totalReportees: number; pendingApprovals: number;
  pendingRequests: LeaveRequest[]; teamCalendar: TeamCalendar[];
}
export interface HRDashboard {
  totalEmployees: number; pendingRequests: number;
  approvedThisMonth: number; rejectedThisMonth: number;
  departmentStats: DepartmentStat[];
  allPendingRequests: LeaveRequest[];
  monthlyStats: MonthlyStat[];
}
export interface TeamCalendar {
  employeeName: string; fromDate: string; toDate: string; leaveType: string; status: string;
}
export interface Holiday { name: string; date: string; }
export interface DepartmentStat {
  department: string; totalRequests: number; approved: number; rejected: number; pending: number;
}
export interface MonthlyStat {
  month: string; total: number; approved: number; rejected: number; pending: number;
}
export interface AddEmployeeResponse {
  id: number; name: string; email: string; role: string;
  department: string; employeeCode: string; tempPassword: string;
}
