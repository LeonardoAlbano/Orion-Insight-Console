import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import {
  PoChartModule,
  PoChartType,
  PoChartSerie,
} from '@po-ui/ng-components';
import {
  catchError,
  map,
  of,
  shareReplay,
  Observable,
} from 'rxjs';

import { NasaApodService } from '../../../../core/services/nasa-apod.service';
import { NasaNeoService } from '../../../../core/services/nasa-neo.service';
import type { NeoTodaySummary } from '../../../../core/validation/nasa-neo.schema';

type DashboardNeoSummary = NeoTodaySummary & {
  hazardousPercent: number;
  riskLevel: 'low' | 'moderate' | 'high';
};

type NeoDailyStat = {
  date: string;
  total: number;
  hazardous: number;
};

type ChartViewModel = {
  categories: string[];
  lineSeries: PoChartSerie[];
  donutSeries: PoChartSerie[];
  total: number;
  totalHazardous: number;
  totalSafe: number;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, PoChartModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent {
  private readonly apodService = inject(NasaApodService);
  private readonly neoService = inject(NasaNeoService);

  readonly lineChartType: PoChartType = PoChartType.Line;
  readonly donutChartType: PoChartType = PoChartType.Donut;

  apod$: Observable<any> = this.apodService.getToday().pipe(
    catchError((err) => {
      console.error('Erro ao buscar APOD', err);
      return of(null);
    }),
  );

  neoSummary$: Observable<DashboardNeoSummary> =
    this.neoService.getTodaySummary().pipe(
      map((summary): DashboardNeoSummary => {
        const total = summary.total ?? 0;
        const hazardous = summary.hazardous ?? 0;

        const hazardousPercent =
          total > 0 ? Math.round((hazardous / total) * 100) : 0;

        let riskLevel: DashboardNeoSummary['riskLevel'] = 'low';

        if (hazardousPercent >= 40) {
          riskLevel = 'high';
        } else if (hazardousPercent >= 15) {
          riskLevel = 'moderate';
        }

        return {
          ...summary,
          hazardousPercent,
          riskLevel,
        };
      }),
      catchError((err) => {
        console.error('Erro ao buscar NeoWs', err);

        const fallback: DashboardNeoSummary = {
          total: 0,
          hazardous: 0,
          closestKm: null,
          hazardousPercent: 0,
          riskLevel: 'low',
        };

        return of(fallback);
      }),
      shareReplay(1),
    );

  readonly dailyChartVm$: Observable<ChartViewModel> =
    this.neoService.getDailyStatsLastNDays(7).pipe(
      catchError((err) => {
        console.error('Erro ao buscar stats diários NeoWs', err);
        return of<NeoDailyStat[]>([]);
      }),
      map((stats: NeoDailyStat[]): ChartViewModel => {
        const categories = stats.map((s) => s.date);
        const totals = stats.map((s) => s.total);
        const hazardous = stats.map((s) => s.hazardous);

        const totalHazardous = hazardous.reduce((sum, v) => sum + v, 0);
        const total = totals.reduce((sum, v) => sum + v, 0);
        const totalSafe = Math.max(total - totalHazardous, 0);

        const lineSeries: PoChartSerie[] = [
          {
            label: 'Total de objetos',
            data: totals,
          },
          {
            label: 'Perigosos',
            data: hazardous,
          },
        ];

        const donutSeries: PoChartSerie[] = [
          {
            label: 'Perigosos',
            data: [totalHazardous],
          },
          {
            label: 'Normais',
            data: [totalSafe],
          },
        ];

        return {
          categories,
          lineSeries,
          donutSeries,
          total,
          totalHazardous,
          totalSafe,
        };
      }),
      shareReplay(1),
    );
}
