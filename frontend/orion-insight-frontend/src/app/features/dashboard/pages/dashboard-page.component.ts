import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import { PoChartModule, PoChartType } from '@po-ui/ng-components';
import { Observable } from 'rxjs';

import {
  DashboardObjectsFacade,
  DashboardNeoSummary,
  ChartViewModel,
} from '../dashboard.objects.facade';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, PoChartModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent {
  private readonly facade = inject(DashboardObjectsFacade);

  readonly lineChartType: PoChartType = PoChartType.Line;
  readonly donutChartType: PoChartType = PoChartType.Donut;

  readonly apod$ = this.facade.apod$;
  readonly neoSummary$: Observable<DashboardNeoSummary> = this.facade.neoSummary$;
  readonly dailyChartVm$: Observable<ChartViewModel> = this.facade.dailyChartVm$;
}
