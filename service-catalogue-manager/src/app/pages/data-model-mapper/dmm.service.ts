import { Injectable } from '@angular/core';
import { NgxConfigureService } from 'ngx-configure';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../model/appConfig';
import { AdapterEntry } from '../../model/adapter/adapterEntry';

@Injectable()
export class DMMService {

  private config: AppConfig;

  private dmmUrl: string;

  constructor(configService: NgxConfigureService, private http: HttpClient) {
    this.config = configService.config as AppConfig;

  }

  getSchemas(): any {
    return this.http.get<any[]>(this.config.data_model_mapper.default_mapper_base_url+"/dataModels").toPromise();

  }
  getMaps(): any {
    return this.http.get<any[]>(this.config.data_model_mapper.default_mapper_base_url+"/maps").toPromise();
  }
  saveMap(adapter: AdapterEntry, map, schema): any {
    return this.http.post<any[]>(this.config.data_model_mapper.default_mapper_base_url+"/map/register", {
     id : adapter.adapterId,
     name : adapter.name,
     map : map,
     dataModel: schema[0]
    }).toPromise();
  }

  /*
  getAdaptedService(type: string, source: string, adapter: AdapterEntry): Promise<ServiceModel[]> {
    return this.http.post<ServiceModel[]>(adapter.url, {
      "sourceDataType": type,
      "sourceData": source,
      "adapterID": adapter.adapterId,
      "config": {
        "delimiter": ";",
        "NGSI_entity" : false
      }
    }).toPromise();
  }*/


}
