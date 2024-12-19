import { Injectable } from '@angular/core';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

@Injectable({
  providedIn: 'root',
})
export class SoapClientService {

  private info = 'http://atmcinestar.sytes.net/cswsinfo/info.asmx?wsdl';
  private trans = 'http://atmcinestar.sytes.net/cswstrans/trans.asmx?wsdl';


  async getSession() {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsTrans/Trans">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetSession>
          </tem:GetSession>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var sesion = '';
    
    try {

      const response = await axios.post(this.trans, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsTrans/Trans/GetSession'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      // console.log(result);

      sesion = result['soap:Envelope']['soap:Body']['GetSessionResponse']['GetSessionResult'];
      
    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return sesion;
  }

  async getUSer() {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsTrans/Trans">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetUser>
            <tem:pTheatreID>191</tem:pTheatreID>
            <tem:pUserID>1010</tem:pUserID>
            <tem:pPass>1010</tem:pPass>
          </tem:GetUser>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var sesion = '';
    
    try {

      const response = await axios.post(this.trans, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsTrans/Trans/GetUser'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      console.log(result);

      // sesion = result['soap:Envelope']['soap:Body']['GetSessionResponse']['GetSessionResult'];
      
    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return sesion;
  }

  //---------------------Home---------------------//

  //Obtiene las peliculas
  async getMovies() {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsInfo/Info">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:Moviesv2>
            <tem:TheatreGroupId>191</tem:TheatreGroupId>
            <tem:FilterId>MWITHSCHEDULE</tem:FilterId>
          </tem:Moviesv2>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var features = [];
    
    try {

      const response = await axios.post(this.info, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsInfo/Info/Moviesv2'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      // console.log(result);

      features = result['soap:Envelope']['soap:Body']['Moviesv2Response']['Moviesv2Result']['root']['Feature'];
      
      // console.log(features);

    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return features;
  }

  //Obtiene las imagenes de la peliculas
  async getPoster(FeatureID: any) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsInfo/Info">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetPoster>
            <tem:TheatreGroupId>191</tem:TheatreGroupId>
            <tem:FeatureID>` + FeatureID + `</tem:FeatureID>
          </tem:GetPoster>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var poster = '';
    
    try {

      const response = await axios.post(this.info, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsInfo/Info/GetPoster'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      // console.log(result);

      poster = result['soap:Envelope']['soap:Body']['GetPosterResponse']['GetPosterResult'];
      
    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return poster;
  }

  //Obtiene las funciones de las peliculas
  async getShows(FeatureID: any) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsInfo/Info">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:ShowTimeByDateAndMovie>
            <tem:TheatreGroupId>191</tem:TheatreGroupId>
            <tem:SDate>20241210</tem:SDate>
            <tem:FeatureId>`+ FeatureID +`</tem:FeatureId>
            <tem:FilterId></tem:FilterId>
          </tem:ShowTimeByDateAndMovie>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var show : any = [];
    
    try {

      const response = await axios.post(this.info, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsInfo/Info/ShowTimeByDateAndMovie'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      // console.log(result);

      if(result['soap:Envelope']['soap:Body']['ShowTimeByDateAndMovieResponse']['ShowTimeByDateAndMovieResult']['root']['Show']){
        show = result['soap:Envelope']['soap:Body']['ShowTimeByDateAndMovieResponse']['ShowTimeByDateAndMovieResult']['root']['Show'];
      }
      

    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return show;
  }

  //---------------------Home---------------------//

  //---------------------Seats---------------------//

  async getSeats(session: string) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsTrans/Trans">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetSeats>
            <tem:pTheatreID>191</tem:pTheatreID>
            <tem:pScheduleID>4022</tem:pScheduleID>
            <tem:pSessionID>${session}</tem:pSessionID>
            <tem:pWorkstation>91</tem:pWorkstation>
          </tem:GetSeats>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var seats: any = [];
    
    try {

      const response = await axios.post(this.trans, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsTrans/Trans/GetSeats'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      const seatsDistribution = result['soap:Envelope']['soap:Body']['GetSeatsResponse']['GetSeatsResult']['root']['Distribution'];

      seats = seatsDistribution.Zones.Zone.Seats.Seat
      
    } catch (error) {

      console.error('Error al llamar al método SOAP:', error);
    }

    return seats;
  }
}
