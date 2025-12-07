import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardPageComponent } from './dashboard-page.component';
import { NasaApodService } from '../../../core/services/nasa-apod.service';
import { NasaNeoService } from '../../../core/services/nasa-neo.service';
import { of } from 'rxjs';

class NasaApodServiceMock {
  getToday() {
    return of(null);
  }
}

class NasaNeoServiceMock {
  getTodaySummary() {
    return of({
      total: 0,
      hazardous: 0,
      closestKm: null,
    });
  }

  getDailyStatsLastNDays() {
    return of([]);
  }
}

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent, HttpClientTestingModule],
      providers: [
        { provide: NasaApodService, useClass: NasaApodServiceMock },
        { provide: NasaNeoService, useClass: NasaNeoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
