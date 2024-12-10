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
    this.soapClient.callMoviesMethod();
    // Llama al método SOAP
  }

}