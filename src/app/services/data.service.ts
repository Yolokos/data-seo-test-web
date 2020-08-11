import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Data } from '../models/data.model';
import { DataRequest } from '../models/dataRequest.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
    environment: string = "https://localhost:5001";
    constructor(private http: HttpClient) {
    }

    getData(): Observable<Data[]>{
        return this.http.get<Data[]>(this.environment + '/api/Data');
    }
    
    editData(data: Data): Observable<any>{
        return this.http.put<any>(this.environment + '/api/Data', data);
    }

    createData(data: Data): Observable<any>{
        return this.http.post<any>(this.environment + '/api/Data', data);
    }

    checkStatusTask(searchEngine: string, taskId: string): Observable<any>{
        return this.http.get<any>(this.environment + '/api/DataSeo/check_status/' + searchEngine + '/' + taskId);
    }

    getRegions(searchEngine: string): Observable<any>{
        return this.http.get<any>(this.environment + '/api/DataSeo/regions/' + searchEngine);
    }

    send(request: DataRequest): Observable<any>{
        return this.http.post<any>(this.environment + '/api/DataSeo/send', request);
    }
}