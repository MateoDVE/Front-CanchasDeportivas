import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourtService } from '../../services/court.service';
import { ComplexService } from '../../services/complex.service';
import { Court } from '../../models/court.model';
import { Complex } from '../../models/complex.model';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courts.html',
  styleUrls: ['./courts.scss'],
})
export class CourtsComponent implements OnInit {
  private router = inject(Router);
  private courtService = inject(CourtService);
  private complexService = inject(ComplexService);

  search = '';
  filterType = '';
  filterEst = '';
  filterDate = '';
  maxPrice = 200;
  loading = true;

  types = ['Futsal', 'Wally', 'Racket', 'Padel'];

  courts: Court[] = [];
  establishments: Complex[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.complexService.getActiveComplexes().subscribe({
      next: (complexes) => {
        this.establishments = complexes;
      },
      error: (err) => {
        console.error('Error al cargar complejos:', err);
      },
    });

    this.courtService.getAllCourts().subscribe({
      next: (courts) => {
        this.courts = courts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar canchas:', err);
        this.loading = false;
      },
    });
  }

  get filtered(): Court[] {
    return this.courts.filter((c) => {
      const nameMatch =
        !this.search ||
        c.name.toLowerCase().includes(this.search.toLowerCase()) ||
        c.courtType.toLowerCase().includes(this.search.toLowerCase());

      if (!nameMatch) return false;

      if (this.filterType && c.courtType !== this.filterType) {
        return false;
      }

      if (this.filterEst && c.complexId !== Number(this.filterEst)) {
        return false;
      }

      if (c.pricePerHour > this.maxPrice) {
        return false;
      }

      return true;
    });
  }

  getEst(complexId: number): Complex | undefined {
    return this.establishments.find((e) => e.id === Number(complexId));
  }

  goDetail(id: number): void {
    this.router.navigate(['/court-detail', id]);
  }
}
