// src/app/shared/components/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  private add(message: string, type: Toast['type'], icon: string): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, icon };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    setTimeout(() => this.remove(id), 4000);
  }

  success(message: string): void { this.add(message, 'success', 'bi-check-circle-fill'); }
  error(message: string): void { this.add(message, 'danger', 'bi-x-circle-fill'); }
  warning(message: string): void { this.add(message, 'warning', 'bi-exclamation-triangle-fill'); }
  info(message: string): void { this.add(message, 'info', 'bi-info-circle-fill'); }

  remove(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
