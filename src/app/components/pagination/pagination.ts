import { Component, input, output } from '@angular/core';

export function pageNumber(page: number, total: number, size = 10): number {
  return Math.max(1, Math.min(page, Math.max(1, Math.ceil(total / size))));
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (total() > 0) {
      <nav [attr.aria-label]="label()">
        <span role="status">{{ start }}–{{ end }} de {{ total() }} {{ unit() }}</span>
        <div class="controls">
          <button type="button" (click)="pageChange.emit(current - 1)" [disabled]="current <= 1" aria-label="Página anterior">Anterior</button>
          <span>Página {{ current }} de {{ pages }}</span>
          <button type="button" (click)="pageChange.emit(current + 1)" [disabled]="current >= pages" aria-label="Página siguiente">Siguiente</button>
        </div>
      </nav>
    }
  `,
  styles: [`
    :host { display: block; }
    nav { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:16px 0; color:#475569; font-size:14px; }
    .controls { display:flex; align-items:center; gap:12px; }
    button { min-height:44px; padding:8px 14px; border:1px solid #cbd5e1; border-radius:8px; background:white; color:#047857; font:inherit; cursor:pointer; }
    button:hover:not(:disabled) { background:#ecfdf5; border-color:#059669; }
    button:focus-visible { outline:3px solid #059669; outline-offset:2px; }
    button:disabled { color:#64748b; background:#f1f5f9; cursor:default; }
    @media(max-width:480px) { nav { justify-content:center; } .controls { gap:8px; } button { padding:8px 10px; } }
  `],
})
export class PaginationComponent {
  total = input.required<number>();
  page = input(1);
  size = input(10);
  label = input('Paginación');
  unit = input('registros');
  pageChange = output<number>();
  get pages() { return Math.max(1, Math.ceil(this.total() / this.size())); }
  get current() { return pageNumber(this.page(), this.total(), this.size()); }
  get start() { return (this.current - 1) * this.size() + 1; }
  get end() { return Math.min(this.current * this.size(), this.total()); }
}
