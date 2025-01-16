import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';

import { SidebarMenuComponent } from '../../shared/sidebar-menu/sidebar-menu.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

import { SoapClientService } from '../../core/services/soap-client.service';

import { FormsModule } from '@angular/forms';

import { NgbCalendar, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';  // Asegúrate de tener la ruta correcta para el servicio

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SidebarMenuComponent,
    LoadingComponent,
    FormsModule,
    NgbModule,
    HttpClientModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends LoadingComponent {

  today = inject(NgbCalendar).getToday();
  model: NgbDateStruct;

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

  screen: any = [];
  movies_arr: any = [];
  movie_screen: any = [];
  movie_screen_original: any = [];

  selectedDate: Date = new Date();
  isPast: boolean = false;
  movie_times: any = [];
  dateTime: string = "";
  times_movie: any = [];

  cardLoading: boolean = false;
  config: any;

  constructor(
    private soapClient: SoapClientService,
    private router: Router,
    private configService: ConfigService
  ) {
    super();
    this.selectedDate = new Date();
    this.model = { year: this.selectedDate.getFullYear(), month: this.selectedDate.getMonth() + 1, day: this.selectedDate.getDate() }
    // this.openModal();
  }

  async ngOnInit() {
    this.configService.configValue$.subscribe((data) => {
      this.config = data;
      console.log(this.config);  // Accede a la configuración cargada

      if (this.config) {
        console.log('Configuración cargada en El componente Icono home:',  this.config);
        // Inyectar baseUrl como variable CSS
        document.documentElement.style.setProperty('--base-url', this.config.baseUrl);
      }
    });
 
    const sessionValid = await this.ValSession();

    if (!sessionValid) {
      this.router.navigate(['/login']);
      return;
  }

    this.openModal();

    await this.GetScreen();

    this.updateTimes()
    // await this.GetMovies();

    this.startInterval();
  }

  async GetScreen() {

    this.movies_arr = await this.soapClient.getMovies();

    await this.DataPoster();

    console.log(this.movies_arr);

    this.screen = await this.soapClient.getScreen(this.formatDateToString(this.now));

    this.movie_screen = await this.getCurrentOrUpcomingShows(this.screen);

    console.log("this.movie_screen", this.movie_screen);

    this.movie_screen_original = this.movie_screen;

    await this.DataMovie();

    // console.log(this.movie_times)

    await this.OrdingMovies(this.movie_screen);

    setTimeout(() => {
      this.closeModal();
    }, 500);

    // console.log(this.toStart)
    // console.log(this.inProgress)
    // console.log(this.toFinish)
  }

  async DataMovie() {

    // console.log(this.movie_screen);

    this.movie_screen.forEach(async (show: any) => {

      const scheduleDate = `${show.ScheduleDate.slice(0, 4)}-${show.ScheduleDate.slice(4, 6)}-${show.ScheduleDate.slice(6, 8)}`;
      const startTime = new Date(`${scheduleDate}T${show.StartTime}:00`);
      const endTime = new Date(startTime.getTime() + parseInt(show.TotalRuntime) * 60000);
      const endThreshold = new Date(endTime.getTime() - 20 * 60 * 1000);// EndDate - 20 minutos

      // Calcular la diferencia en minutos
      const diffInMinutes = Math.floor((this.date.getTime() - startTime.getTime()) / 60000);
      const adjustedDiff = parseInt(show.TotalRuntime) - diffInMinutes;
      const starts = Math.floor((startTime.getTime() - this.date.getTime()) / 60000);

      // Agregar propiedades al objeto show
      show.Elapsed = this.convertMinutesAndHours(diffInMinutes);
      show.Remaining = this.convertMinutesAndHours(adjustedDiff);
      show.TotalMinutes = this.convertMinutesAndHours(parseInt(show.TotalRuntime));
      show.Progress = this.calculateProgress(startTime, endTime);
      show.Starts = this.convertMinutesAndHours(starts);
      // show.Poster = await this.soapClient.getPoster(show.FeatureId);
    });

  }

  async DataPoster() {

    // Obtener los posters de forma asíncrona y esperar a que todas las promesas se completen
    await Promise.all(this.movies_arr.map(async (movie: any) => {
      movie.Poster = await this.soapClient.getPoster(movie.FeatureId);
    }));

  }

  async getCurrentOrUpcomingShows(shows: any[], marginMinutes: number = 15) {

    let now = new Date();
    const result: any = {};
    this.movie_times = [];

    const promises = shows.map(async (screen: any) => {

      let shows_array = [];

      // console.log("array", Array.isArray(screen.Show));

      if(Array.isArray(screen.Show)){
        shows_array = screen.Show;
      }else{
        shows_array.push(screen.Show);
      }

      await Promise.all(shows_array.map(async (show: any) => {

        // console.log("show", show);
        const timeStr = `${screen.ScheduleDate.slice(0, 4)}-${screen.ScheduleDate.slice(4, 6)}-${screen.ScheduleDate.slice(6, 8)}T${show.StartTime}`;
        const startTime = new Date(timeStr);

        if (this.isPast) {
          now = new Date(timeStr);
        }

        const filteredMovies = this.movies_arr.filter((movie: any) => movie.FeatureId === show.FeatureId);

        if (filteredMovies.length === 0) {
          console.error(`No se encontró la película con FeatureId: ${show.FeatureId}`);
          return;
        }

        const movie = filteredMovies[0];
        const endTime = new Date(startTime.getTime() + parseInt(movie.TotalRuntime) * 60000);
        // const marginStartTime = new Date(startTime.getTime() - marginMinutes * 60000);

        if ((now >= startTime && now <= endTime) || (startTime > now)) {
          if (!result[screen.ScreenID] || startTime < result[screen.ScreenID].startTime) {
            result[screen.ScreenID] = {
              screen,
              show,
              movie,
              startTime,
              endTime,
              // marginStartTime
            };
          }
        }

        if (!this.movie_times.includes(show.StartTime)) {
          this.movie_times.push(show.StartTime);
        }
      }));

          
    });

    await Promise.all(promises);
    // console.log(result);

    const showsArray = Object.keys(result).map(key => ({
      FeatureId: result[key].movie.FeatureId,
      Title: result[key].movie.Title,
      Poster: result[key].movie.Poster,
      TotalRuntime: result[key].movie.TotalRuntime,
      ScheduleId: result[key].show.ScheduleId,
      StartTime: result[key].show.StartTime,
      ScreenName: result[key].screen.ScreenName,
      ScheduleDate: result[key].screen.ScheduleDate,
      IsSold: result[key].show.Habilitadas == result[key].show.Seats
    }));

    // console.log("showsArray", showsArray);
    return showsArray;
  }

  updateTimes() {

    // console.log(this.movie_times);

    const newTimes = this.filterPastTimes(this.movie_times);

    this.times_movie = newTimes;

    // console.log("aca", this.times_movie)

    this.times_movie.sort((a: any, b: any) => {
      const [hourA, minuteA] = a.split(':').map(Number);
      const [hourB, minuteB] = b.split(':').map(Number);

      if (hourA < hourB) return -1;
      if (hourA > hourB) return 1;
      if (minuteA < minuteB) return -1;
      if (minuteA > minuteB) return 1;
      return 0;
    });
  }

  filterPastTimes(times: string[]): string[] {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    const dia = now;
    dia.setHours(0, 0, 0, 0);

    const fecha = this.now;
    fecha.setHours(0, 0, 0, 0);

    return times.filter(time => {
      const [hour, minute] = time.split(':').map(Number);
      if (hour > nowHours) return true;
      if (hour === nowHours && minute >= nowMinutes) return true;
      if (fecha.getTime() != dia.getTime()) return true;
      return false;
    });
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

    // console.log("pelis",pelis)
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

  async dataShowSort(shows: any[], screen: any) {

    shows.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

    return shows.map(show => {

      const movie = this.movies_arr.filter((movie: any) => movie.FeatureId === show.FeatureId);
      const totalMinutes = parseInt(movie.TotalRuntime, 10);

      const startDate = new Date(`${screen.ScheduleDate.slice(0, 4)}-${screen.ScheduleDate.slice(4, 6)}-${screen.ScheduleDate.slice(6, 8)}T${show.StartTime}`);
      const endDate = new Date(startDate.getTime() + totalMinutes * 60000);

      // Calcular la diferencia en minutos
      const diffInMinutes = Math.floor((this.date.getTime() - startDate.getTime()) / 60000);
      const adjustedDiff = totalMinutes - diffInMinutes;

      return {
        FeatureId: movie[0].FeatureId,
        Title: movie[0].Title,
        TotalRuntime: movie[0].TotalRuntime,
        ScheduleId: show.ScheduleId,
        StartTime: show.StartTime,
        ScreenName: screen.ScreenName,
        ScheduleDate: screen.ScheduleDate
      };

      // return {
      //   StartTime: show.StartTime,
      //   ScreenName: show.ScreenName,
      //   ScheduleDate: show.ScheduleDate,
      //   ScheduleId: show.ScheduleId,
      //   StartDate: startDate,
      //   EndDate: endDate
      // };

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

        if (this.filterTime) {
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

  OrdingMovies(filtro: any) {

    this.toStart = [];
    this.inProgress = [];
    this.toFinish = [];

    filtro.forEach((movie: any) => {

      // console.log(movie);

      const show = movie;

      const scheduleDate = `${show.ScheduleDate.slice(0, 4)}-${show.ScheduleDate.slice(4, 6)}-${show.ScheduleDate.slice(6, 8)}`;
      const startTime = new Date(`${scheduleDate}T${show.StartTime}:00`);
      const endTime = new Date(startTime.getTime() + parseInt(show.TotalRuntime) * 60000);
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
      }else if (this.isPast) {
        this.toStart.push(movie);
      }

    });
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
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

    if (this.filterTime) {

      this.isNow = false;
      this.filterTimeMovies();

    } else {

      this.movies = this.moviesOri;
    }

  }

  async searchDate(fecha: string) {

    this.isDateValid = false;

    this.isNow = false;
    this.isBadge = false;

    const [day, month, year] = fecha.split('/').map(part => parseInt(part, 10));

    const date_1 = new Date(year, month - 1, day);

    // console.log(date_1.getTime());

    const date_2 = new Date();

    date_2.setHours(0, 0, 0, 0);

    // console.log(date_2.getTime());

    this.now = date_1;

    await this.GetMovies();

    if (date_1.getTime() == date_2.getTime()) {
      this.isNow = true;
      this.isBadge = true;

    } else if (date_1.getTime() > date_2.getTime()) {
      this.isBadge = true;
    }

    this.isDateValid = true;
  }

  startInterval() {

    this.intervalId = setInterval(async () => {


      this.date = new Date();

      this.screen = await this.soapClient.getScreen(this.formatDateToString(this.now));

      console.log("this.screen", this.screen);

      this.movie_screen_original = await this.getCurrentOrUpcomingShows(this.screen);

      this.movie_screen = this.movie_screen_original;

      console.log("movie screen:", this.movie_screen);

      await this.FilterMovie();

      this.updateTimes();

      // let filtro = await this.filterMovies();

      // console.log("filtro", filtro);

      // filtro = this.filterSearchMovies(filtro);

      // filtro = filtro.sort((a, b) => this.timeToMinutes(a?.Show.StartTime) - this.timeToMinutes(b?.Show.StartTime));

      // this.screen

    


      await this.DataMovie();
      await this.OrdingMovies(this.movie_screen);
      // await this.OrdingMovies(filtro);

      // console.log("toStart", this.toStart);
      // console.log("inProgress", this.inProgress);
      // console.log("toFinish", this.toFinish);

    }, 5000);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  filterSearchMovies(movies: any) {
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
  redirectToSeats(movieId: string, ScheduleId: string, ScheduleDate: string): void {
    // console.log(" movieId",  movieId);
    // console.log(" ScheduleId",  ScheduleId);
    // console.log(" ScheduleDate",  ScheduleDate);
    this.router.navigate([`seats`, movieId, ScheduleId, ScheduleDate]); // Redirige a la ruta con el ID de la película, ScheduleId, y ScheduleDate
  }

  async ValSession() {
    const userSession = localStorage.getItem('userSession');

    console.log("userSession", userSession?.trim());

    if (!userSession || userSession.trim() == '') {
      return false;
    }

    return true;
  }

  ngOnDestroy() {
    console.log('Componente Home destruido.');
    this.stopInterval();
  }

  async DateInput(newDate: any) {

    this.cardLoading = true;

    this.toStart = [];
    this.inProgress = [];
    this.toFinish = [];
    this.filterTime = false;
    this.dateTime = "";

    this.isPast = false;
    this.now = new Date(`${newDate.year}-${newDate.month < 10 ? "0" + newDate.month : newDate.month}-${newDate.day < 10 ? "0" + newDate.day : newDate.day}T00:00:00`);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Establecer la hora a medianoche
    // console.log(this.now);
    // console.log(hoy);

    if (this.now.getTime() < hoy.getTime()) {
      this.isPast = true;
    }

    this.screen = await this.soapClient.getScreen(this.formatDateToString(this.now));

    // console.log(this.screen);

    this.movie_screen_original = await this.getCurrentOrUpcomingShows(this.screen);

    this.movie_screen = this.movie_screen_original;

    await this.DataMovie();

    await this.OrdingMovies(this.movie_screen);

    setTimeout(() => {
      this.cardLoading = false;
    }, 500)
  }

  async FilterTime(event: any) {
    const selectedTime = event.target.value;
    this.dateTime = selectedTime;

    if (selectedTime != "") {
      this.filterTime = true;
    } else {
      this.filterTime = false;
      this.movie_screen = this.movie_screen_original;
    }

    await this.FilterMovie();
  }

  async FilterMovie() {

    let now = new Date();
    const result: any = {};
    
    const promises = this.screen.map(async (screen: any) => {

      let shows_array = [];

      if(Array.isArray(screen.Show)){
        shows_array = screen.Show;
      }else{
        shows_array.push(screen.Show);
      }

      await Promise.all(shows_array.map(async (show: any) => {

        const timeStr = `${screen.ScheduleDate.slice(0, 4)}-${screen.ScheduleDate.slice(4, 6)}-${screen.ScheduleDate.slice(6, 8)}T${show.StartTime}`;

        const startTime = new Date(timeStr);

        let filteredMovies = this.movies_arr.filter((movie: any) => movie.FeatureId === show.FeatureId);

        if (this.searchTerm) {
          filteredMovies = this.movies_arr.filter((movie: any) => movie.FeatureId === show.FeatureId && movie.Title.toLowerCase().includes(this.searchTerm.toLowerCase()));
        }


        if (filteredMovies.length === 0) {
          console.error(`No se encontró la película con FeatureId: ${show.FeatureId}`);
          return;
        }

        const movie = filteredMovies[0];

        const endTime = new Date(startTime.getTime() + parseInt(filteredMovies[0].TotalRuntime) * 60000);
  
        if (this.dateTime) {

          if (this.dateTime == show.StartTime) {
            result[screen.ScreenID] = {
              screen,
              show,
              movie,
              startTime,
              endTime,
              // marginStartTime
            };
          }

        } else {

          if ((now >= startTime && now <= endTime) || (startTime > now) || this.isPast){
            if (!result[screen.ScreenID] || startTime < result[screen.ScreenID].startTime) {
              result[screen.ScreenID] = {
                screen,
                show,
                movie,
                startTime,
                endTime,
                // marginStartTime
              };
            }
          }

        }

      }));
    });

    await Promise.all(promises);
    console.log(result);

    // Convertir el resultado a un array
    const showsArray = Object.keys(result).map(key => ({
      // screen: result[key].screen,
      // show: result[key].show,
      // movie: result[key].movie,

      Poster: result[key].movie.Poster,
      FeatureId: result[key].movie.FeatureId,
      Title: result[key].movie.Title,
      TotalRuntime: result[key].movie.TotalRuntime,
      ScheduleId: result[key].show.ScheduleId,
      StartTime: result[key].show.StartTime,
      ScreenName: result[key].screen.ScreenName,
      ScheduleDate: result[key].screen.ScheduleDate,
      IsSold: result[key].show.Habilitadas == result[key].show.Seats
    }));

    this.movie_screen = showsArray;
  }

  async SearchTermMovie() {

    await this.FilterMovie();

  }
}
