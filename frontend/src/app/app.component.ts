import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { ToastComponent } from './shared/components/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, ToastComponent],
  template: `
    <app-navbar *ngIf="auth.isLoggedIn"></app-navbar>
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
