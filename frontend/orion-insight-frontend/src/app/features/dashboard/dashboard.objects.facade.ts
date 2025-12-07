import { inject, Injectable } from '@angular/core';
import { PoChartSerie } from '@po-ui/ng-components';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { NasaApodService } from '../../core/services/nasa-apod.service';
import {
  NasaNeoService,
  NeoDailyStat,
} from '../../core/services/nasa-neo.service';
import type { NasaApod } from '../../core/validation/nasa-apod.schema';
import type { NeoTodaySummary } from '../../core/validation/nasa-neo.schema';

export type DashboardNeoSummary = NeoTodaySummary & {
  hazardousPercent: number;
  riskLevel: 'low' | 'moderate' | 'high';
};

export type ChartViewModel = {
  categories: string[];
  lineSeries: PoChartSerie[];
  donutSeries: PoChartSerie[];
  total: number;
  totalHazardous: number;
  totalSafe: number;
};

@Injectable({ providedIn: 'root' })
export class DashboardObjectsFacade {
  private readonly apodService = inject(NasaApodService);
  private readonly neoService = inject(NasaNeoService);

  readonly apod$: Observable<NasaApod | null> = this.apodService.getToday().pipe(
    catchError((err) => {
      console.error('Erro ao buscar APOD', err);
      return of(null);
    }),
    shareReplay(1),
  );

  readonly neoSummary$: Observable<DashboardNeoSummary> =
    this.neoService.getTodaySummary().pipe(
      map((summary): DashboardNeoSummary => {
        const total = summary.total ?? 0;
        const hazardous = summary.hazardous ?? 0;

        const hazardousPercent =
          total > 0 ? Math.round((hazardous / total) * 100) : 0;

        let riskLevel: DashboardNeoSummary['riskLevel'];

        if (total === 0 || hazardous === 0) {
          riskLevel = 'low';
        } else if (hazardousPercent >= 40) {
          riskLevel = 'high';
        } else {
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
      map((stats: NeoDailyStat[]): ChartViewModel => {
        const categories = stats.map((s) => s.date);
        const totals = stats.map((s) => s.total);
        const hazardous = stats.map((s) => s.hazardous);

        const total = totals.reduce((sum, v) => sum + v, 0);
        const totalHazardous = hazardous.reduce((sum, v) => sum + v, 0);
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
