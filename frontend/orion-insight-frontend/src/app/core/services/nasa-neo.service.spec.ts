import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NasaNeoService } from './nasa-neo.service';
import { NASA_API_KEY } from '../config/nasa.config';
import type { NasaNeoObject } from '../validation/nasa-neo.schema';

describe('NasaNeoService', () => {
  let service: NasaNeoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NasaNeoService],
    });

    service = TestBed.inject(NasaNeoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve calcular getClosestDistanceKm corretamente', () => {
    const mockList: NasaNeoObject[] = [
      {
        id: '1',
        name: 'Asteroid 1',
        absolute_magnitude_h: 0,
        estimated_diameter: {} as any,
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            miss_distance: { kilometers: '5000.5' } as any,
            relative_velocity: { kilometers_per_second: '10' } as any,
            close_approach_date: '2025-12-07',
          } as any,
          {
            miss_distance: { kilometers: '3000.2' } as any,
            relative_velocity: { kilometers_per_second: '20' } as any,
            close_approach_date: '2025-12-08',
          } as any,
        ],
        is_sentry_object: false,
        nasa_jpl_url: '',
        neo_reference_id: '',
      } as any,
    ];

    const result = (service as any).getClosestDistanceKm(mockList);
    expect(result).toBeCloseTo(3000.2);
  });

  it('deve retornar null em getClosestDistanceKm quando não há dados', () => {
    const result = (service as any).getClosestDistanceKm([]);
    expect(result).toBeNull();
  });

  it('deve chamar a API da NASA em getTodayFeed', () => {
    service.getTodayFeed().subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === 'https://api.nasa.gov/neo/rest/v1/feed'
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('api_key')).toBe(NASA_API_KEY);

    req.flush({
      element_count: 0,
      near_earth_objects: {},
    });
  });
});
