import { Component, ViewChild, ElementRef } from '@angular/core';
import { SoapClientService } from '../../core/services/soap-client.service';
import { CommonModule } from '@angular/common';

import html2canvas from 'html2canvas';

import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule, SidebarMenuComponent, LoadingComponent],
  templateUrl: './seats.component.html',
  styleUrl: './seats.component.css'
})
export class SeatsComponent extends LoadingComponent {

  @ViewChild('seatContainer') seatContainer!: ElementRef;

  seatsPrint: any = [];

  seatImage: string = '';

  maxX: number = 0;

  maxY: number = 0;

  letters: any = [];

  peliAcutal: any = {};

  showActual: any = {};

  now: Date = new Date();

  MovieId: string | null = "";

  movieShow: any = {};

  constructor(
    private soapClient: SoapClientService,
    private route: ActivatedRoute
  ) {
    super();
  }
  
  async ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.MovieId = params.get('movie');
      console.log(this.MovieId);
    });

    await this.DataPeli();
    // await this.DataSeats();
    
  }

  async DataPeli(){

    var peliculas = await this.soapClient.getMovies();

    const promises = peliculas.map(async (peli: any) => {

      if (peli.FeatureId === this.MovieId) {

        const poster = await this.soapClient.getPoster(peli.FeatureId);
        const show = await this.soapClient.getShows(peli.FeatureId, this.formatDateToString(this.now));

        if (show.length > 0) {

          const show_new = await this.dataShowSort(show, peli.TotalRuntime);

          const data = {
            Id: peli.FeatureId,
            OriginalTitle: peli.OriginalTitle,
            Title: peli.Title,
            TotalRuntime: peli.TotalRuntime,
            Poster: poster,
            Show: show_new
          };

          this.peliAcutal = data; // Agrega los datos al array
        }
      }
    });
    
    await Promise.all(promises);

    this.filterShows();
    await this.DataSeats();

    setInterval(async() => {
      this.now = new Date();
      await this.filterShows();
      await this.DataSeats();
    }, 1000);

    // console.log("pelis", this.peliAcutal);
    // console.log("showActual", this.showActual);
  }

  filterShows() {

    const movie = this.peliAcutal;

    const totalMinutes = parseInt(movie.TotalRuntime, 10);

    const relevantShow = movie.Show.find((show: any) => {
      const startTime = new Date(show.StartDate);
      const endTime = new Date(show.EndDate);
      const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

      // Calcular la diferencia en minutos
      const diffInMinutes = Math.floor((this.now.getTime() - startTime.getTime()) / 60000);
      const adjustedDiff = totalMinutes - diffInMinutes;
      
      show.Elapsed = this.convertMinutesAndHours(diffInMinutes),
      show.Remaining = this.convertMinutesAndHours(adjustedDiff),
      show.TotalMinutes = this.convertMinutesAndHours(totalMinutes)
      show.Progress = this.calculateProgress(startTime, endTime);

      return (
        (this.now >= startTime && this.now < endThreshold) || // Ya comenzó
        (this.now >= endThreshold && this.now <= endTime) || // Terminando
        (this.now < startTime) // Por empezar
      );
    });

    if (relevantShow) {

      const startTime = new Date(relevantShow.StartDate);
      const endTime = new Date(relevantShow.EndDate);
      const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

      relevantShow.StatusPeli = 0;

      if (this.now < startTime) {
        // Por empezar
        relevantShow.StatusPeli = 1;
      } else if (this.now >= startTime && this.now < endThreshold) {
        // En progreso
        relevantShow.StatusPeli = 2;
      } else if (this.now >= endThreshold && this.now <= endTime) {
        // Por terminar
        relevantShow.StatusPeli = 3;
      }
      // Devolver solo una película con un show relevante
      this.showActual =  relevantShow;
      console.log(this.showActual);
    }
  }

  convertMinutesAndHours(diffInMinutes: number): string {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours > 0 ? hours + "h" : ""} ${Math.abs(minutes)}min`;
  }

  calculateProgress(startDate: Date, endDate: Date): number {
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = this.now.getTime() - startDate.getTime();
    return (elapsed / totalDuration) * 100;
  }

  async dataShowSort(shows: any[], timeTotal:string){

    const totalMinutes = parseInt(timeTotal, 10);

    shows.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

    return shows.map(show => {

      const startDate = new Date(`${show.ScheduleDate.slice(0, 4)}-${show.ScheduleDate.slice(4, 6)}-${show.ScheduleDate.slice(6, 8)}T${show.StartTime}`);
      const endDate = new Date(startDate.getTime() + totalMinutes * 60000);
      
      return {
        StartTime: show.StartTime,
        ScreenName: show.ScreenName,
        ScheduleDate: show.ScheduleDate,
        ScheduleId: show.ScheduleId,
        StartDate: startDate,
        EndDate: endDate
      };

    });
  }

  async DataSeats(){

    const session = await this.soapClient.getSession();

    var seats = await this.soapClient.getSeats(session, this.showActual.ScheduleId);

    const coordinates = await this.findMinCoordinates(seats);

    const max = await this.findMaxCoordinates(seats);

    seats = await this.subtractMinCoordinates(seats, coordinates.minX, coordinates.minY);

    await this.findMaxCoordinates(seats);

    seats.sort((a:any, b:any) => {

      const xA = parseInt(a.X, 10);
      const yA = parseInt(a.Y, 10);
      const xB = parseInt(b.X, 10);
      const yB = parseInt(b.Y, 10);

      if (yA !== yB) {
        return yA - yB;
      }
      else {
        return xA - xB;
      }

    });

    this.letters = await this.extractUniqueLetters(seats, coordinates.minX);

    this.seatsPrint = seats;

    setTimeout(()=>{
      this.captureSeatsAsImage();
    }, 100);
    
    
    // console.log(seats);

    // console.log(this.letters);
  }

  async findMinCoordinates(seats: any[]){

    let minX = Infinity;
    let minY = Infinity;

    seats.forEach(seat => {

      const x = parseInt(seat.X, 10);
      const y = parseInt(seat.Y, 10);

      if (x < minX) {
        minX = x;
      } if (y < minY) {
        minY = y;
      }

    });

    // Se ajusta minimo de X para agregar las letras
    minX = minX - 30;

    return { minX, minY };
  }

  async findMaxCoordinates(seats: any[]) {
    let maxX = -Infinity;
    let maxY = -Infinity;
  
    seats.forEach(seat => {
      const x = parseInt(seat.X, 10);
      const y = parseInt(seat.Y, 10);
  
      if (x > maxX) {
        maxX = x;
      }
  
      if (y > maxY) {
        maxY = y;
      }
    });
  
    this.maxX = maxX + 20;
    this.maxY = maxY + 26;
  }
  
  async extractUniqueLetters(seats: any[], minX: number) {

    const lettersSet = new Map<string, number>();

    seats.forEach(seat => {
      const letter = seat.SeatNumber.charAt(0);
      // Obtener la letra
      lettersSet.set(letter, seat.Y);
      // Agregar al conjunto
    });

    const lettersArray = Array.from(lettersSet).map(([letter, y], index) => ({
      letter,
      X: 0, // Colocar la letra a la izquierda de los asientos
      Y: y // Colocar la letra al comienzo de cada fila
    }));

    return lettersArray;
    // Convertir el conjunto a un array
  }

  async subtractMinCoordinates(seats: any[], minX: number, minY: number) {
    return seats.map(seat => ({
      ...seat,
      X: (parseInt(seat.X, 10) - minX).toString(),
      Y: (parseInt(seat.Y, 10) - minY).toString()
    }));
  }

  async captureSeatsAsImage() {
    const element = this.seatContainer.nativeElement;

    // console.log(element);

    const canvas = await html2canvas(element, {
      backgroundColor: null
    });
    this.seatImage = canvas.toDataURL('image/png');

    // console.log(this.seatImage);
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}