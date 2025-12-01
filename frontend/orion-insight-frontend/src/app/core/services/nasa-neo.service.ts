import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { nasaNeoFeedSchema, type NasaNeoFeed } from '../validation/nasa-neo.schema';

@Injectable({ providedIn: 'root' })
export class NasaNeoService {
  private readonly baseUrl = 'https://api.nasa.gov/neo/rest/v1';

  constructor(private http: HttpClient) {}

  getFeed(startDate: string, endDate: string, apiKey: string) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      api_key: apiKey,
    };

    return this.http
      .get<unknown>(`${this.baseUrl}/feed`, { params })
      .pipe(
        map(response => {
          const parsed = nasaNeoFeedSchema.parse(response);
          return parsed as NasaNeoFeed;
        }),
      );
  }
}
