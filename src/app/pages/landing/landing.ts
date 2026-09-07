import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComplexService } from '../../services/complex.service';
import { establishments } from '../../data/mock';

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

  establishments = establishments;

  courtTypes = [
    {
      name: 'Futsal',
      icon: '⚽',
      description: 'Canchas reglamentarias con césped sintético y cemento pulido',
      image: 'https://images.unsplash.com/photo-1763775468707-573c7cd6b0da?w=400&h=280&fit=crop&auto=format',
    },
    {
      name: 'Vóley / Wally',
      icon: '🏐',
      description: 'Canchas con piso de madera flotante y paredes alfombradas',
      image: 'https://images.unsplash.com/photo-1728971121170-2c8bae90d6fb?w=400&h=280&fit=crop&auto=format',
    },
    {
      name: 'Racket',
      icon: '🎾',
      description: 'Canchas de racket y pádel profesionales con visor de vidrio',
      image: 'https://images.unsplash.com/photo-1646649853703-7645147474ba?w=400&h=280&fit=crop&auto=format',
    },
  ];

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
    this.complexService.getActiveComplexes().subscribe({
      next: (complexes) => {
        if (complexes && complexes.length > 0) {
          this.establishments = complexes.map((c, idx) => ({
            id: String(c.id),
            name: c.name,
            address: c.location,
            city: 'Bolivia',
            phone: c.contactInfo,
            image:
              establishments[idx % establishments.length]?.image ||
              'https://images.unsplash.com/photo-1775993167393-f2add1f8eec2?w=600&h=400&fit=crop&auto=format',
            courts: [],
            courtTypes: ['Futsal', 'Wally', 'Racket'],
            priceFrom: 50,
            rating: 4.8,
          }));
        }
      },
      error: () => {
        // Mantiene fallback estático
      },
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