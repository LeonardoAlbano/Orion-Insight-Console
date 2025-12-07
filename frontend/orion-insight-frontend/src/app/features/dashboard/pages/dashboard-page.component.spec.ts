import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DashboardPageComponent } from './dashboard-page.component';
import {
  DashboardObjectsFacade,
  DashboardNeoSummary,
  ChartViewModel,
} from '../dashboard.objects.facade';

class DashboardObjectsFacadeMock {
  apod$ = of(null);

  neoSummary$ = of<DashboardNeoSummary>({
    total: 0,
    hazardous: 0,
    closestKm: null,
    hazardousPercent: 0,
    riskLevel: 'low',
  });

  dailyChartVm$ = of<ChartViewModel>({
    categories: [],
    lineSeries: [],
    donutSeries: [],
    total: 0,
    totalHazardous: 0,
    totalSafe: 0,
  });
}

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        { provide: DashboardObjectsFacade, useClass: DashboardObjectsFacadeMock },
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
