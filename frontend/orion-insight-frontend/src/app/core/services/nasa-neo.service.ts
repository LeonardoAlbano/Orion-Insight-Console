import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import {
  nasaNeoFeedSchema,
  type NasaNeoFeed,
  type NasaNeoObject,
  type NeoTodaySummary,   
} from '../validation/nasa-neo.schema';
import { NASA_API_KEY } from '../config/nasa.config';

@Injectable({ providedIn: 'root' })
export class NasaNeoService {
  private readonly baseUrl = 'https://api.nasa.gov/neo/rest/v1';

  constructor(private http: HttpClient) {}

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getFeed(startDate: string, endDate: string) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      api_key: NASA_API_KEY,
    };

    return this.http
      .get<unknown>(`${this.baseUrl}/feed`, { params })
      .pipe(map((response) => nasaNeoFeedSchema.parse(response) as NasaNeoFeed));
  }

  getTodayFeed() {
    const today = this.getTodayDate();
    return this.getFeed(today, today);
  }

  getFeedRange(startDate: string, endDate: string) {
    return this.getFeed(startDate, endDate);
  }

  getTodayObjects() {
    const today = this.getTodayDate();

    return this.getTodayFeed().pipe(
      map((feed) => feed.near_earth_objects[today] ?? []),
    );
  }

  getObjectsRange(startDate: string, endDate: string) {
    return this.getFeedRange(startDate, endDate).pipe(
      map((feed) => {
        const result: NasaNeoObject[] = [];
        const days = Object.keys(feed.near_earth_objects).sort();

        for (const day of days) {
          const list = feed.near_earth_objects[day] ?? [];
          result.push(...list);
        }

        return result;
      }),
    );
  }

getTodaySummary() {
    const today = this.getTodayDate();

    return this.getTodayFeed().pipe(
      map((feed): NeoTodaySummary => {
        const objectsToday = feed.near_earth_objects[today] ?? [];

        const total = objectsToday.length;
        const hazardous = objectsToday.filter(
          (neo) => neo.is_potentially_hazardous_asteroid,
        ).length;

        const closestKm = this.getClosestDistanceKm(objectsToday);

        const hazardousPercent =
          total > 0 ? Math.round((hazardous / total) * 100) : 0;

        let riskLevel: NeoTodaySummary['riskLevel'];
        if (hazardous === 0) {
          riskLevel = 'low';
        } else if (hazardousPercent <= 30) {
          riskLevel = 'moderate';
        } else {
          riskLevel = 'high';
        }

        return {
          total,
          hazardous,
          closestKm,
          hazardousPercent,
          riskLevel,
        };
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