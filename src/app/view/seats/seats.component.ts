import { Component, ViewChild, ElementRef } from '@angular/core';
import { SoapClientService } from '../../core/services/soap-client.service';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';


@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seats.component.html',
  styleUrl: './seats.component.css'
})
export class SeatsComponent {

  @ViewChild('seatContainer') seatContainer!: ElementRef;

  featureShows: any = [];

  seatsPrint: any = [];

  seatImage: string = '';

  maxX: number = 0;

  maxY: number = 0;

  constructor(private soapClient: SoapClientService) {}
  
  async ngOnInit() {

    // this.DataPeli();
    await this.DataSeats();

    setTimeout(() => {
      this.captureSeatsAsImage();
    }, 100);
  }

  async DataPeli(){

    var peliculas = await this.soapClient.getMovies();

    peliculas.forEach(async (peli:any) => {

      const poster = await this.soapClient.getPoster(peli.FeatureId);
      const show = await this.soapClient.getShows(peli.FeatureId);

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

        await this.featureShows.push(data);
      }

    });
  
    console.log("pelis", this.featureShows);

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

    var seats = await this.soapClient.getSeats(session);

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

    const letters = await this.extractUniqueLetters(seats);

    this.seatsPrint = seats;
    
    // console.log(seats);

    // console.log(letters);
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
  
  async extractUniqueLetters(seats: any[]) {

    const lettersSet = new Set<string>();

    seats.forEach(seat => {
      const letter = seat.SeatNumber.charAt(0);
      // Obtener la letra
      lettersSet.add(letter);
      // Agregar al conjunto
    });

    return Array.from(lettersSet);
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

    const canvas = await html2canvas(element);
    this.seatImage = canvas.toDataURL('image/png');

    // console.log(this.seatImage);
  }
}