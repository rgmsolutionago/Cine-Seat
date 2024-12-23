import { Injectable } from '@angular/core';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

import config from '../../../assets/js/config.json';

@Injectable({
  providedIn: 'root',
})
export class SoapClientService {

  // private info = 'http://atmcinestar.sytes.net/cswsinfo/info.asmx?wsdl';
  // private trans = 'http://atmcinestar.sytes.net/cswstrans/trans.asmx?wsdl';

  private info = config.Info;
  private trans = config.Trans;

  private TheatreID = config.TheatreId;
  private WorkStation = config.WorkStation;

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

  async getUSer(user: string, pass: string) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsTrans/Trans">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetUser>
            <tem:pTheatreID>${this.TheatreID}</tem:pTheatreID>
            <tem:pUserID>${user}</tem:pUserID>
            <tem:pPass>${pass}</tem:pPass>
          </tem:GetUser>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    var sesion = '';
    
    var res = {status: false, msg: "", data: {}};

    try {

      const response = await axios.post(this.trans, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsTrans/Trans/GetUser'
        },
      });

      const result = await parseStringPromise(response.data, { explicitArray: false });

      // console.log(result);

      const data = result['soap:Envelope']['soap:Body']['GetUserResponse']['GetUserResult']['root'];

      if(data['Error']){
        throw new Error(data['Error']['Message']);
      }

      res.status = true;
      res.data = data['User'];

    } catch (error: any) {

      // console.error('Error al llamar al método SOAP:', error);

      res.status = false;
      res.msg = error;
    }

    return res;
  }

  //---------------------Home---------------------//

  //Obtiene las peliculas
  async getMovies() {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsInfo/Info">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:Moviesv2>
            <tem:TheatreGroupId>${this.TheatreID}</tem:TheatreGroupId>
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
            <tem:TheatreGroupId>${this.TheatreID}</tem:TheatreGroupId>
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
  async getShows(FeatureID: any, Date: string) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsInfo/Info">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:ShowTimeByDateAndMovie>
            <tem:TheatreGroupId>${this.TheatreID}</tem:TheatreGroupId>
            <tem:SDate>${Date}</tem:SDate>
            <tem:FeatureId>${FeatureID}</tem:FeatureId>
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

  async getSeats(session: string, ScheduleId: string) {

    const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/CSwsTrans/Trans">
        <soapenv:Header/>
        <soapenv:Body>
          <tem:GetSeats>
            <tem:pTheatreID>${this.TheatreID}</tem:pTheatreID>
            <tem:pScheduleID>${ScheduleId}</tem:pScheduleID>
            <tem:pSessionID>${session}</tem:pSessionID>
            <tem:pWorkstation>${this.WorkStation}</tem:pWorkstation>
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
