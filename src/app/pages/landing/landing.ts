import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComplexService } from '../../services/complex.service';
import { CourtService } from '../../services/court.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private complexService = inject(ComplexService);

  private courtService = inject(CourtService);
  establishments: {id: number; name: string; address: string; image: string | null; courtTypes: string[]; priceFrom: number | null}[] = [];
  loading = true;
  loadError = '';
  courtTypes: {name: string; icon: string; description: string; image: string | null}[] = [];



  steps = [
    {
      n: '01',
      title: 'Encuentra tu cancha',
      desc: 'Explora complejos deportivos y canchas disponibles. Filtra por deporte y tarifa horaria.',
    },
    {
      n: '02',
      title: 'Consulta disponibilidad en vivo',
      desc: 'Revisa el calendario interactivo y elige el horario de 1 hora que prefieras.',
    },
    {
      n: '03',
      title: 'Bloqueo temporal de 5 minutos',
      desc: 'Al seleccionar tu horario, el sistema lo reserva por 5 minutos asegurando tu cupo.',
    },
    {
      n: '04',
      title: 'Paga tu anticipo (25%) vía QR',
      desc: 'Abona el 25% escaneando el código QR y paga el 75% restante al llegar a jugar.',
    },
  ];

  ngOnInit(): void {
    forkJoin({complexes: this.complexService.getActiveComplexes(), courts: this.courtService.getAllCourts()}).subscribe({
      next: ({complexes, courts}) => {
        const active = courts.filter(c => c.isActive && complexes.some(e => e.id === c.complexId));
        this.establishments = complexes.map(c => {
          const own = active.filter(court => court.complexId === c.id);
          return { id: c.id, name: c.name, address: c.location,
            image: own.flatMap(court => court.images)[0] || null,
            courtTypes: [...new Set(own.map(court => court.courtType))],
            priceFrom: own.length ? Math.min(...own.map(court => court.pricePerHour)) : null };
        });
        this.courtTypes = [...new Set(active.map(c => c.courtType))].map(name => ({
          name, icon: '🏟️', description: 'Consulta las canchas disponibles de este deporte.',
          image: active.find(c => c.courtType === name && c.images.length)?.images[0] || null
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; this.loadError = 'No se pudieron cargar los complejos. Intenta nuevamente más tarde.'; }
    });
  }

  navigate(page: string): void {
    if (page === 'courts') {
      this.router.navigate(['/courts']);
    } else {
      this.router.navigate(['/']);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
