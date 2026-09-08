import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-court-cover', standalone: true,
  template: `
    <div class="cover-editor">
      @if (value()) { <img [src]="value()" alt="Vista previa de la portada" /> }
      @else { <div class="placeholder">Sin portada personalizada</div> }
      <label>Seleccionar imagen
        <input type="file" accept="image/jpeg,image/png,image/webp" (change)="select($event)" [disabled]="disabled()" />
      </label>
      <small>JPG, PNG o WebP · máximo 2 MB. Recomendamos una foto horizontal.</small>
      @if (value()) { <button type="button" (click)="valueChange.emit('')" [disabled]="disabled()">Quitar portada</button> }
      @if (error()) { <p role="alert">{{ error() }}</p> }
    </div>
  `,
  styles: `
    .cover-editor { display: grid; gap: 10px; margin: 16px 0; }
    img, .placeholder { width: 100%; height: 180px; object-fit: cover; border-radius: 12px; background: #f1f5f9; }
    .placeholder { display: grid; place-items: center; color: #64748b; border: 1px dashed #cbd5e1; }
    label { display: grid; gap: 8px; font-weight: 600; color: #334155; }
    input { max-width: 100%; font: inherit; font-size: 14px; }
    small { color: #64748b; } button { justify-self: start; color: #be123c; cursor: pointer; } p { color: #be123c; }
  `,
})
export class CourtCoverComponent {
  value = input('');
  disabled = input(false);
  valueChange = output<string>();
  error = signal('');
  private request = 0;

  select(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.error.set('');
    const request = ++this.request;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.error.set('Selecciona una imagen JPG, PNG o WebP de hasta 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => this.error.set('No se pudo leer la imagen. Intenta con otro archivo.');
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => { if (request === this.request) this.error.set('El archivo no es una imagen válida.'); };
      image.onload = () => { if (request === this.request) this.valueChange.emit(reader.result as string); };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
