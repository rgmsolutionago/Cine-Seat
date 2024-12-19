import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

import { SoapClientService } from '../../core/services/soap-client.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarMenuComponent, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends LoadingComponent {
  
  // array principal con las peliculas y sus funciones.
  movies: any[] = [];
  
  // array's de los filtros para el front.
  toStart: any[] = [];
  inProgress: any[] = [];
  toFinish: any[] = [];

  // fecha actual
  now: Date = new Date("2024-12-10T20:02:00");

  constructor(private soapClient: SoapClientService){
    super();
    // this.openModal();
  }

  ngOnInit(){
    this.openModal();

    this.GetMovies();
  }

  async GetMovies() {

    this.movies = [];

    const pelis = await this.soapClient.getMovies();

    // Crear un array de promesas para los posters y shows
    const promises = pelis.map(async (peli: any) => {

        const poster = await this.soapClient.getPoster(peli.FeatureId);
        const shows = await this.soapClient.getShows(peli.FeatureId);

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
        }
    });

    // Esperar a que todas las promesas se completen
    await Promise.all(promises);

    console.log(this.movies);
    
    this.closeModal();

    const filtro = this.filterMovies();
    // console.log(filtro);

    this.OrdingMovies(filtro);

    console.log("toStart", this.toStart);
    console.log("inProgress", this.inProgress);
    console.log("toFinish", this.toFinish);
    
  }

  async dataShowSort(shows: any[], timeTotal:string){

    const totalMinutes = parseInt(timeTotal, 10);

    shows.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

    return shows.map(show => {

      const startDate = new Date(`${show.ScheduleDate.slice(0, 4)}-${show.ScheduleDate.slice(4, 6)}-${show.ScheduleDate.slice(6, 8)}T${show.StartTime}`);
      const endDate = new Date(startDate.getTime() + totalMinutes * 60000);

      // Calcular la diferencia en minutos
      const diffInMinutes = Math.floor((this.now.getTime() - startDate.getTime()) / 60000);
      const adjustedDiff = totalMinutes - diffInMinutes;
      
      return {
        StartTime: show.StartTime,
        ScreenName: show.ScreenName,
        ScheduleDate: show.ScheduleDate,
        ScheduleId: show.ScheduleId,
        StartDate: startDate,
        EndDate: endDate,
        Elapsed: this.convertMinutesAndHours(diffInMinutes),
        Remaining: this.convertMinutesAndHours(adjustedDiff),
        TotalMinutes: this.convertMinutesAndHours(totalMinutes)
      };

    });
  }

  convertMinutesAndHours(diffInMinutes: number): string {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours > 0 ? hours + "h" : ""} ${Math.abs(minutes)}min`;
  }

  filterMovies() {

    const pelis = this.movies;

    return pelis.map(movie => {
      const relevantShow = movie.Show.find((show: any) => {
        const startTime = new Date(show.StartDate);
        const endTime = new Date(show.EndDate);
        const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

        return (
          (this.now >= startTime && this.now < endThreshold) || // Ya comenzó
          (this.now >= endThreshold && this.now <= endTime) || // Terminando
          (this.now < startTime) // Por empezar
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

  OrdingMovies(filtro: any){

    this.toStart = [];
    this.inProgress = [];
    this.toFinish = [];

    filtro.forEach((movie: any) => {
      const show = movie.Show;
      const startTime = new Date(show.StartDate);
      const endTime = new Date(show.EndDate);
      const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000); // EndDate - 20 minutos

      if (this.now < startTime) {
        // Por empezar
        this.toStart.push(movie);
      } else if (this.now >= startTime && this.now < endThreshold) {
        // En progreso
        this.inProgress.push(movie);
      } else if (this.now >= endThreshold && this.now <= endTime) {
        // Por terminar
        this.toFinish.push(movie);
      }

    });
  }

}
