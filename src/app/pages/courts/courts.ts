import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  courts,
  establishments,
  Court,
  Establishment
} from '../../data/mock';

@Component({
  selector: 'app-courts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './courts.html',
  styleUrls: ['./courts.scss']
})
export class CourtsComponent {

  search = '';
  filterType = '';
  filterEst = '';
  filterDate = '';
  maxPrice = 150;

  types = [
    'Futsal',
    'Vóley',
    'Racket',
    'Pádel',
    'Básquet'
  ];

  courts: Court[] = courts;

  establishments: Establishment[] = establishments;

  constructor(
    private router: Router
  ) {}

  get filtered(): Court[] {

    return this.courts.filter(c => {

      if (
        this.search &&
        !c.name.toLowerCase().includes(this.search.toLowerCase()) &&
        !c.type.toLowerCase().includes(this.search.toLowerCase())
      ) {
        return false;
      }

      if (
        this.filterType &&
        c.type !== this.filterType
      ) {
        return false;
      }

      if (
        this.filterEst &&
        c.establishmentId !== this.filterEst
      ) {
        return false;
      }

      if (
        c.pricePerHour > this.maxPrice
      ) {
        return false;
      }

      return true;
    });
  }

  getEst(id: string): Establishment | undefined {
    return this.establishments.find(
      e => e.id === id
    );
  }

  goDetail(id: string): void {

    this.router.navigate([
      '/court-detail',
      id
    ]);
  }
}