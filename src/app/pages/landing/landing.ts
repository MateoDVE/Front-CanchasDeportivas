import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { establishments } from '../../data/mock';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {

  establishments = establishments;

  courtTypes = [
    {
      name: 'Futsal',
      icon: '⚽',
      description: 'Canchas profesionales con piso reglamentario',
      image: 'https://images.unsplash.com/photo-1763775468707-573c7cd6b0da?w=400&h=280&fit=crop&auto=format'
    },
    {
      name: 'Vóley',
      icon: '🏐',
      description: 'Canchas de vóley indoor y playa',
      image: 'https://images.unsplash.com/photo-1728971121170-2c8bae90d6fb?w=400&h=280&fit=crop&auto=format'
    },
    {
      name: 'Racket',
      icon: '🎾',
      description: 'Canchas de racket y pádel con paredes de vidrio',
      image: 'https://images.unsplash.com/photo-1646649853703-7645147474ba?w=400&h=280&fit=crop&auto=format'
    },
    {
      name: 'Básquet',
      icon: '🏀',
      description: 'Canchas de básquetbol reglamentarias',
      image: 'https://images.unsplash.com/photo-1768842407056-6c64fe629c2e?w=400&h=280&fit=crop&auto=format'
    }
  ];

  steps = [
    {
      n: '01',
      title: 'Encuentra tu cancha',
      desc: 'Explora establecimientos y canchas disponibles cerca de ti. Filtra por tipo, precio y disponibilidad.'
    },
    {
      n: '02',
      title: 'Selecciona fecha y horario',
      desc: 'Consulta el calendario de disponibilidad en tiempo real y elige el horario que más te convenga.'
    },
    {
      n: '03',
      title: 'Realiza tu reserva',
      desc: 'Confirma los datos de tu reserva y revisa el resumen con el precio total y el anticipo requerido.'
    },
    {
      n: '04',
      title: 'Confirma tu anticipo',
      desc: 'Realiza el pago del anticipo del 25% para asegurar tu cancha. El saldo lo abonas al llegar.'
    }
  ];

  constructor(private router: Router) {}

  navigate(page: string): void {
    if (page === 'courts') {
      this.router.navigate(['/courts']);
    } else {
      this.router.navigate(['/']);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}