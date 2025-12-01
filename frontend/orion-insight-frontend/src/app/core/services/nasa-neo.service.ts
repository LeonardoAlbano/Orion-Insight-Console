import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import {
  nasaNeoFeedSchema,
  type NasaNeoFeed,
  type NasaNeoObject,
} from '../validation/nasa-neo.schema';
import { NASA_API_KEY } from '../config/nasa.config';

@Injectable({ providedIn: 'root' })
export class NasaNeoService {
  private readonly baseUrl = 'https://api.nasa.gov/neo/rest/v1';

  constructor(private http: HttpClient) {}

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getTodayFeed() {
    const today = this.getTodayDate();

    const params = {
      start_date: today,
      end_date: today,
      api_key: NASA_API_KEY,
    };

    return this.http
      .get<unknown>(`${this.baseUrl}/feed`, { params })
      .pipe(map((response) => nasaNeoFeedSchema.parse(response) as NasaNeoFeed));
  }

  getTodaySummary() {
    return this.getTodayFeed().pipe(
      map((feed) => {
        const today = this.getTodayDate();
        const objectsToday = feed.near_earth_objects[today] ?? [];

        const total = objectsToday.length;
        const hazardous = objectsToday.filter(
          (neo) => neo.is_potentially_hazardous_asteroid,
        ).length;

        const closestKm = this.getClosestDistanceKm(objectsToday);

        return { total, hazardous, closestKm };
      }),
    );
  }

  private getClosestDistanceKm(objects: NasaNeoObject[]): number | null {
    let minDistance: number | null = null;

    for (const neo of objects) {
      for (const approach of neo.close_approach_data) {
        const km = parseFloat(approach.miss_distance.kilometers);
        if (Number.isNaN(km)) continue;

        if (minDistance === null || km < minDistance) {
          minDistance = km;
        }
      }
    }

    return minDistance;
  }
}
