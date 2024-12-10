import { Component, OnInit } from '@angular/core';
import { SoapClientService } from '../../core/services/soap-client.service';

@Component({
  selector: 'app-seats',
  standalone: true,
  imports: [],
  templateUrl: './seats.component.html',
  styleUrl: './seats.component.css'
})
export class SeatsComponent {

  constructor(private soapClient: SoapClientService) {}
  // Inyecta el servicio SOAP
  ngOnInit() {
    // this.soapClient.getMovies();
    // this.soapClient.getPoster();
    this.DataPeli();
  }

  async DataPeli(){

    var peliculas = await this.soapClient.getMovies();

    peliculas.forEach(async (peli:any) => {
      const poster = await this.soapClient.getPoster(peli.FeatureId);
      const show = await this.soapClient.getShows(peli.FeatureId);
      peli.Poster = poster;
      peli.Show = show;
    });
  
    console.log("pelis", peliculas);
  }

}