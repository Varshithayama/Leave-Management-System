import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toast-container {
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 300px;
      max-width: 380px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      animation: slideIn 0.25s ease;
      cursor: pointer;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-success { background: #198754; color: white; }
    .toast-danger  { background: #dc3545; color: white; }
    .toast-warning { background: #ffc107; color: #1a1a1a; }
    .toast-info    { background: #0d6efd; color: white; }
  `],
  template: `
  <div class="toast-container">
    <div class="toast-item toast-{{t.type}}"
         *ngFor="let t of (toastService.toasts$ | async)"
         (click)="toastService.remove(t.id)">
      <i class="bi {{t.icon}} fs-5"></i>
      <span>{{ t.message }}</span>
    </div>
  </div>`
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
