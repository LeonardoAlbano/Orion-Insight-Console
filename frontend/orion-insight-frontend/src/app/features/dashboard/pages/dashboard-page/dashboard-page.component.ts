import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { catchError, of } from 'rxjs';

import { NasaApodService } from '../../../../core/services/nasa-apod.service';
import { NasaNeoService } from '../../../../core/services/nasa-neo.service';
import type { NeoTodaySummary } from '../../../../core/validation/nasa-neo.schema';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent {
  private readonly apodService = inject(NasaApodService);
  private readonly neoService = inject(NasaNeoService);

  apod$ = this.apodService.getToday().pipe(
    catchError((err) => {
      console.error('Erro ao buscar APOD', err);
      return of(null);
    }),
  );

  neoSummary$ = this.neoService.getTodaySummary().pipe(
    catchError((err) => {
      console.error('Erro ao buscar NeoWs', err);

      const fallback: NeoTodaySummary = {
        total: 0,
        hazardous: 0,
        closestKm: null,
        hazardousPercent: 0,
        riskLevel: 'low',
      };

      return of(fallback);
    }),
  );
}
