import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { nasaApodSchema } from '../validation/nasa-apod.schema';
import { NASA_API_KEY } from '../config/nasa.config';

@Injectable({ providedIn: 'root' })
export class NasaApodService {
  private readonly baseUrl = 'https://api.nasa.gov/planetary/apod';

  constructor(private http: HttpClient) {}

  getToday() {
    const params = { api_key: NASA_API_KEY };

    return this.http.get<unknown>(this.baseUrl, { params }).pipe(
      map((response) => nasaApodSchema.parse(response)),
    );
  }
}
