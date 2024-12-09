import { Injectable } from '@angular/core';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

@Injectable({
  providedIn: 'root',
})
export class SoapClientService {
  private url = 'http://atmcinestar.sytes.net/cswsinfo/info.asmx?wsdl';

  async callMoviesMethod() {
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

    const soapRequest2 = {
      TheatreGroupId: 191,
      FilterId: 'MWITHSCHEDULE'
    }
    
    try {
      const response = await axios.post(this.url, soapRequest, {
        headers: {
          'Content-Type': 'text/xml',
          'SOAPAction': 'http://tempuri.org/CSwsInfo/Info/Moviesv2'
        },
      });
      const result = await parseStringPromise(response.data);
      console.log(result);
    } catch (error) {
      console.error('Error al llamar al método SOAP:', error);
    }
  }
}
