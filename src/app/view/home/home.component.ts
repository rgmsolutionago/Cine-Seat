import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

import { SoapClientService } from '../../core/services/soap-client.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarMenuComponent, LoadingComponent,FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends LoadingComponent {
  
  // array principal con las peliculas y sus funciones.
  movies: any[] = [];
  moviesOri: any[] = [];
  
  // array's de los filtros para el front.
  toStart: any[] = [];
  inProgress: any[] = [];
  toFinish: any[] = [];

  // fecha actual
  now: Date = new Date();//"2024-12-10T20:02:00"
  date: Date = new Date();

  isDateValid: boolean = false;

  private intervalId: any;

  isNow: boolean = true;
  isBadge: boolean = true;

  searchTerm: string = "";
  searchTime: string = "";

  filterTime: boolean = false;

  constructor(
    private soapClient: SoapClientService,
    private router: Router
  ){
    super();
    // this.openModal();
  }

  async ngOnInit(){

    const sessionValid = await this.ValSession();

    if (!sessionValid) {
      this.router.navigate(['/login']);
      return;
    }

    this.openModal();

    await this.GetMovies();

    this.startInterval();
  }

  async GetMovies() {

    this.movies = [];
    this.moviesOri = [];

    const movie_arr = await this.soapClient.getMovies();

    var pelis: any = [];

    if (Array.isArray(movie_arr)) {

      pelis = movie_arr;

    } else if (movie_arr) {

      pelis.push(movie_arr);
    }

    console.log("pelis",pelis)
    // Crear un array de promesas para los posters y shows
    const promises = pelis.map(async (peli: any) => {

        const poster = await this.soapClient.getPoster(peli.FeatureId);
        const shows = await this.soapClient.getShows(peli.FeatureId, this.formatDateToString(this.now));

        if (shows.length > 0) {
        
          const show_new = await this.dataShowSort(shows, peli.TotalRuntime);
  
          const data = {
            Id: peli.FeatureId,
            OriginalTitle: peli.OriginalTitle,
            Title: peli.Title,
            TotalRuntime: peli.TotalRuntime,
            Poster: poster,
            Show: show_new
          };
  
          // await this.featureShows.push(data);

          this.movies.push(data);
          this.moviesOri.push(data);
        }
    });

    // Esperar a que todas las promesas se completen
    await Promise.all(promises);

    let filtro = await this.filterMovies();

    filtro = filtro.sort((a, b) => this.timeToMinutes(a?.Show.StartTime) - this.timeToMinutes(b?.Show.StartTime));
    
    await this.OrdingMovies(filtro);
    
    this.closeModal();
    
  }

  async dataShowSort(shows: any[], timeTotal:string){

    const totalMinutes = parseInt(timeTotal, 10);

    shows.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

    return shows.map(show => {

      const startDate = new Date(`${show.ScheduleDate.slice(0, 4)}-${show.ScheduleDate.slice(4, 6)}-${show.ScheduleDate.slice(6, 8)}T${show.StartTime}`);
      const endDate = new Date(startDate.getTime() + totalMinutes * 60000);

      // Calcular la diferencia en minutos
      const diffInMinutes = Math.floor((this.date.getTime() - startDate.getTime()) / 60000);
      const adjustedDiff = totalMinutes - diffInMinutes;
      
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

  convertMinutesAndHours(diffInMinutes: number): string {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours > 0 ? hours + "h" : ""} ${Math.abs(minutes)}min`;
  }

  calculateProgress(startDate: Date, endDate: Date): number {
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = this.date.getTime() - startDate.getTime();
    return (elapsed / totalDuration) * 100;
  }

  filterMovies() {

    const pelis = this.movies;

    console.log(pelis);
    return pelis.map(movie => {

      const totalMinutes = parseInt(movie.TotalRuntime, 10);

      const relevantShow = movie.Show.find((show: any) => {

        const startTime = new Date(show.StartDate);
        const endTime = new Date(show.EndDate);
        const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

        // Calcular la diferencia en minutos
        const diffInMinutes = Math.floor((this.date.getTime() - startTime.getTime()) / 60000);
        const adjustedDiff = totalMinutes - diffInMinutes;
        const starts = Math.floor((startTime.getTime() - this.date.getTime()) / 60000);
        
        show.Elapsed = this.convertMinutesAndHours(diffInMinutes);
        show.Remaining = this.convertMinutesAndHours(adjustedDiff);
        show.TotalMinutes = this.convertMinutesAndHours(totalMinutes);
        show.Progress = this.calculateProgress(startTime, endTime);
        show.Starts = this.convertMinutesAndHours(starts);

        
        if(this.filterTime){
          return (show.StartTime == this.searchTime);
        }

        return (
          (this.date >= startTime && this.date < endThreshold) || // Ya comenzó
          (this.date >= endThreshold && this.date <= endTime) || // Terminando
          (this.date < startTime) // Por empezar
        );
      });

      if (relevantShow) {
        // Devolver solo una película con un show relevante
        return {
          Id: movie.Id,
          Title: movie.Title,
          OriginalTitle: movie.OriginalTitle,
          TotalRuntime: movie.TotalRuntime,
          Poster: movie.Poster,
          Show: relevantShow
        };
      }

      return null; // No incluir películas sin shows relevantes
    }).filter(movie => movie !== null); // Filtrar nulos
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  OrdingMovies(filtro: any){

    this.toStart = [];
    this.inProgress = [];
    this.toFinish = [];

    filtro.forEach((movie: any) => {
      const show = movie.Show;
      const startTime = new Date(show.StartDate);
      const endTime = new Date(show.EndDate);
      const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

      if (this.date < startTime) {
        // Por empezar
        this.toStart.push(movie);
      } else if (this.date >= startTime && this.date < endThreshold) {
        // En progreso
        this.inProgress.push(movie);
      } else if (this.date >= endThreshold && this.date <= endTime) {
        // Por terminar
        this.toFinish.push(movie);
      }

    });
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  onDateInput(event: any) {
    let input = event.target.value;
    input = input.replace(/\D/g, '');
    // Eliminar caracteres no numéricos
    if (input.length > 2) input = `${input.slice(0, 2)}/${input.slice(2)}`;
    if (input.length > 5) input = `${input.slice(0, 5)}/${input.slice(5, 9)}`;
    event.target.value = input;

    this.isDateValid = this.validateDate(event.target.value);
  }

  validateDate(date: string): boolean {
    // Expresión regular para validar el formato dd/mm/yyyy
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return datePattern.test(date);
  }

  onTimeInput(event: any) {

    this.isNow = true;

    let input = event.target.value.replace(/\D/g, '');

    this.filterTime = false;

    if (input.length >= 4) {
      input = input.slice(0, 4);
      this.filterTime = true;
    }

    if (input.length > 2) {
      input = `${input.slice(0, 2)}:${input.slice(2)}`;
    }

    event.target.value = input;
    this.searchTime = input;

    if(this.filterTime){

      this.isNow = false;
      this.filterTimeMovies();

    }else{

      this.movies = this.moviesOri;
    }

  }

  async searchDate(fecha: string){

    this.isDateValid = false;

    this.isNow = false;
    this.isBadge = false;

    const [day, month, year] = fecha.split('/').map(part => parseInt(part, 10));
    
    const date_1 = new Date(year, month - 1, day);

    // console.log(date_1.getTime());

    const date_2 = new Date();

    date_2.setHours(0 , 0 , 0 , 0);

    // console.log(date_2.getTime());

    this.now = date_1;

    await this.GetMovies();

    if(date_1.getTime() == date_2.getTime()){
      this.isNow = true;
      this.isBadge = true;

    }else if(date_1.getTime() > date_2.getTime()){
      this.isBadge = true;
    }

    this.isDateValid = true;
  }

  startInterval() {

    this.intervalId = setInterval(async() => {

      this.date = new Date();
      let filtro = await this.filterMovies();

      console.log("filtro", filtro);

      filtro = this.filterSearchMovies(filtro);

      filtro = filtro.sort((a, b) => this.timeToMinutes(a?.Show.StartTime) - this.timeToMinutes(b?.Show.StartTime));

      await this.OrdingMovies(filtro);

      console.log("toStart", this.toStart);
      console.log("inProgress", this.inProgress);
      console.log("toFinish", this.toFinish);
      
    }, 1000);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  filterSearchMovies(movies:any) {
    return movies.filter((movie: any) => {
      const matchTitle = !this.searchTerm || movie.Title.toLowerCase().includes(this.searchTerm.toLowerCase()) || movie.OriginalTitle.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStartTime = movie.Show.StartTime.includes(this.searchTerm);
      return matchTitle;
    });
  }

  filterTimeMovies() {
    this.movies = this.moviesOri.filter(movie => {
      const matchStartTime = movie.Show.some((show: any) => show.StartTime.includes(this.searchTime));
      return matchStartTime;
    });
  }

  // Función para redireccionar
  redirectToSeats(movieId: string, ScheduleId: string): void {
    console.log(" ScheduleId",  ScheduleId);
    this.router.navigate([`seats`, movieId, ScheduleId]); // Redirige a la ruta con el ID de la película
  }

  async ValSession(){
    const userSession = localStorage.getItem('userSession');

    console.log("userSession", userSession?.trim());

    if (!userSession || userSession.trim() == '') {
      return false;
    }

    return true;
  }
}
