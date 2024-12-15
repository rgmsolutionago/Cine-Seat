import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  peliculas = [
    {
      imagen: 'https://i.imgur.com/JANnvbE.png',
      sala: 1,
      nombre: 'Resident Evil Damnation',
      hora: '08:30 PM',
      estado: 'Por Empezar',
      duracion: '1h 35min'
    },
    {
      imagen: 'https://i.imgur.com/rY9veWm.png',
      sala: 2,
      nombre: 'The Matrix',
      hora: '10:00 PM',
      estado: 'En Transcurso',
      duracion: '2h 16min',
    },
    {
      imagen: 'https://i.imgur.com/0ZSI2ls.png',
      sala: 3,
      nombre: 'I Am Zlatan',
      hora: '10:30 PM',
      estado: 'En Transcurso',
      duracion: '2h 42min'
    },
    {
      imagen: 'https://i.imgur.com/ZyRWqkn.png',
      sala: 4,
      nombre: 'Pride & Prejudice',
      hora: '08:30 PM',
      estado: 'Por Empezar',
      duracion: '1h 35min'
    },
    {
      imagen: 'https://i.imgur.com/n3OO3kJ.png',
      sala: 5,
      nombre: 'The Shining',
      hora: '10:00 PM',
      estado: 'En Transcurso',
      duracion: '2h 16min',
    },
    {
      imagen: 'https://i.imgur.com/I9GPOZq.png',
      sala: 6,
      nombre: 'The Dark Knight Rises',
      hora: '10:30 PM',
      estado: 'En Transcurso',
      duracion: '2h 42min'
    }
  ];
}
