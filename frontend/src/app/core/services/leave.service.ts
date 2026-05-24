import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LeaveRequest, LeaveBalance, LeaveType,
  EmployeeDashboard, ManagerDashboard, HRDashboard
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private api = `${environment.apiUrl}/leaves`;
  constructor(private http: HttpClient) {}

  applyLeave(data: { leaveTypeId: number; fromDate: string; toDate: string; reason: string; isHalfDay: boolean }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.api, data);
  }
  getMyLeaves(): Observable<LeaveRequest[]> { return this.http.get<LeaveRequest[]>(`${this.api}/my`); }
  getBalances(): Observable<LeaveBalance[]> { return this.http.get<LeaveBalance[]>(`${this.api}/balances`); }
  getEmployeeDashboard(): Observable<EmployeeDashboard> { return this.http.get<EmployeeDashboard>(`${this.api}/dashboard/employee`); }
  getPendingApprovals(): Observable<LeaveRequest[]> { return this.http.get<LeaveRequest[]>(`${this.api}/pending-approvals`); }
  getPendingManagerLeaves(): Observable<LeaveRequest[]> { return this.http.get<LeaveRequest[]>(`${this.api}/pending-manager-leaves`); }
  actionLeave(id: number, action: string, comment?: string): Observable<any> {
    return this.http.put(`${this.api}/${id}/action`, { action, comment });
  }
  getManagerDashboard(): Observable<ManagerDashboard> { return this.http.get<ManagerDashboard>(`${this.api}/dashboard/manager`); }
  getAllLeaves(): Observable<LeaveRequest[]> { return this.http.get<LeaveRequest[]>(`${this.api}/all`); }
  getHRDashboard(): Observable<HRDashboard> { return this.http.get<HRDashboard>(`${this.api}/dashboard/hr`); }
  getById(id: number): Observable<LeaveRequest> { return this.http.get<LeaveRequest>(`${this.api}/${id}`); }
  getLeaveTypes(): Observable<LeaveType[]> { return this.http.get<LeaveType[]>(`${environment.apiUrl}/leavetypes`); }
}
