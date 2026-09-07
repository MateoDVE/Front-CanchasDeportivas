import { Component } from '@angular/core';
import { ConfirmationComponent } from './components/confirmation/confirmation';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    ConfirmationComponent,
    NavbarComponent,
    FooterComponent
  ],

  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
