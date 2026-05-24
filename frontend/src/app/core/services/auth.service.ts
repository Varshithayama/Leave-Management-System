import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<AuthResponse | null>(this.getStored());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get user(): AuthResponse | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.user; }
  get role(): string { return this.user?.role ?? ''; }
  get userId(): number { return this.user?.userId ?? 0; }
  get isEmployee(): boolean { return this.role === 'Employee'; }
  get isManager(): boolean { return this.role === 'Manager'; }
  get isHRAdmin(): boolean { return this.role === 'HRAdmin'; }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(user => { localStorage.setItem('lm_user', JSON.stringify(user)); this.userSubject.next(user); }));
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap(user => { localStorage.setItem('lm_user', JSON.stringify(user)); this.userSubject.next(user); }));
  }

  logout(): void {
    localStorage.removeItem('lm_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private getStored(): AuthResponse | null {
    const s = localStorage.getItem('lm_user');
    return s ? JSON.parse(s) : null;
  }
}
