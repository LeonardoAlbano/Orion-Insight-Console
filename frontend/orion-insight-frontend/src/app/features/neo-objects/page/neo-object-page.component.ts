import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PoLoadingModule,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';

import { NasaNeoService } from '../../../core/services/nasa-neo.service';
import type { NasaNeoObject } from '../../../core/validation/nasa-neo.schema';

type NeoTableItem = {
  name: string;
  approachDate: string;
  missDistanceKm: number | null;
  velocityKmS: number | null;
  risk: 'dangerous' | 'safe';
};

type RiskFilter = 'all' | 'dangerous' | 'safe';
type DaysFilter = 1 | 3 | 7;

@Component({
  selector: 'app-neo-objects-page',
  standalone: true,
  imports: [CommonModule, PoTableModule, PoLoadingModule],
  templateUrl: './neo-object-page.component.html',
  styleUrls: ['./neo-object-page.component.scss'],
})
export class NeoObjectsPageComponent {
  private readonly neoService = inject(NasaNeoService);

  private readonly daysFilterSubject = new BehaviorSubject<DaysFilter>(1);
  private readonly riskFilterSubject = new BehaviorSubject<RiskFilter>('all');
  private readonly searchFilterSubject = new BehaviorSubject<string>('');

  private readonly daysFilter$ = this.daysFilterSubject.asObservable();
  private readonly riskFilter$ = this.riskFilterSubject.asObservable();
  private readonly searchFilter$ = this.searchFilterSubject.asObservable();


  private readonly baseItems$: Observable<NeoTableItem[]> = this.daysFilter$.pipe(
    switchMap((days) => this.loadRange(days)),
    shareReplay(1),
  );

  private loadRange(days: DaysFilter): Observable<NeoTableItem[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const startStr = this.toDateInputValue(start);
    const endStr = this.toDateInputValue(end);

    return this.neoService.getObjectsRange(startStr, endStr).pipe(
      map((objects) => this.mapToTableItems(objects)),
      catchError((err) => {
        console.error('Erro ao carregar Near Earth Objects', err);
        return of<NeoTableItem[]>([]);
      }),
    );
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  readonly filteredItems$ = combineLatest([
    this.baseItems$,
    this.riskFilter$,
    this.searchFilter$,
  ]).pipe(
    map(([items, risk, search]) => {
      let result = items;
      if (risk === 'dangerous') {
        result = result.filter((item) => item.risk === 'dangerous');
      } else if (risk === 'safe') {
        result = result.filter((item) => item.risk === 'safe');
      }

      const term = search.trim().toLowerCase();
      if (term) {
        result = result.filter((item) => {
          const name = item.name.toLowerCase();
          const date = item.approachDate.toLowerCase();
          return name.includes(term) || date.includes(term);
        });
      }

      return result;
    }),
  );

  onRiskFilterChange(value: RiskFilter): void {
    this.riskFilterSubject.next(value);
  }

  onSearchChange(value: string): void {
    this.searchFilterSubject.next(value);
  }

  onDaysFilterChange(value: string): void {
    const days = Number(value) as DaysFilter;
    if (days === 1 || days === 3 || days === 7) {
      this.daysFilterSubject.next(days);
    }
  }

  private readonly defaultColumns: PoTableColumn[] = [
    {
      property: 'name',
      label: 'Objeto',
      width: '20%',
    },
    {
      property: 'approachDate',
      label: 'Data de aproximação',
      type: 'date',
      width: '18%',
    },
    {
      property: 'missDistanceKm',
      label: 'Distância (km)',
      type: 'number',
      format: '1.0-0',
      width: '20%',
    },
    {
      property: 'velocityKmS',
      label: 'Velocidade (km/s)',
      type: 'number',
      format: '1.1-1',
      width: '20%',
    },
    {
      property: 'risk',
      label: 'Risco',
      type: 'subtitle',
      width: '15%',
      subtitles: [
        {
          value: 'dangerous',
          label: 'Perigoso',
          content: 'PER',
          color: 'color-07',
        },
        {
          value: 'safe',
          label: 'Normal',
          content: 'NOR',
          color: 'color-11',
        },
      ],
    },
  ];

  columns: PoTableColumn[] = [...this.defaultColumns];

  allColumns: PoTableColumn[] = [...this.defaultColumns];

  isColumnModalOpen = false;

  openColumnModal(): void {
    this.isColumnModalOpen = true;
  }

  closeColumnModal(): void {
    this.isColumnModalOpen = false;
  }

  getColumnLabel(col: PoTableColumn): string {
    return (col.label as string) ?? (col.property as string);
  }

  isColumnVisible(col: PoTableColumn): boolean {
    return this.columns.some((c) => c.property === col.property);
  }

  onColumnCheckboxChange(col: PoTableColumn, checked: boolean): void {
    const prop = col.property;
    if (!prop) return;

    if (checked) {

      if (!this.columns.some((c) => c.property === prop)) {
        const ordered: PoTableColumn[] = [];
        for (const baseCol of this.defaultColumns) {
          const already = this.columns.find(
            (c) => c.property === baseCol.property,
          );
          if (baseCol.property === prop) {
            ordered.push(baseCol);
          }
          if (already && !ordered.includes(already)) {
            ordered.push(already);
          }
        }
        this.columns = ordered;
      }
    } else {
      this.columns = this.columns.filter((c) => c.property !== prop);
    }
  }

  moveColumnUp(index: number): void {
    if (index <= 0 || index >= this.columns.length) return;
    const cols = [...this.columns];
    const [col] = cols.splice(index, 1);
    cols.splice(index - 1, 0, col);
    this.columns = cols;
  }

  moveColumnDown(index: number): void {
    if (index < 0 || index >= this.columns.length - 1) return;
    const cols = [...this.columns];
    const [col] = cols.splice(index, 1);
    cols.splice(index + 1, 0, col);
    this.columns = cols;
  }

  restoreDefaultColumns(): void {
    this.columns = [...this.defaultColumns];
    this.allColumns = [...this.defaultColumns];
  }
  private mapToTableItems(objects: NasaNeoObject[]): NeoTableItem[] {
    return objects.map((neo) => {
      const firstApproach = neo.close_approach_data[0];

      const missKm = firstApproach
        ? parseFloat(firstApproach.miss_distance.kilometers)
        : NaN;

      const velKmS = firstApproach
        ? parseFloat(firstApproach.relative_velocity.kilometers_per_second)
        : NaN;

      return {
        name: neo.name,
        approachDate: firstApproach?.close_approach_date ?? '',
        missDistanceKm: Number.isFinite(missKm) ? missKm : null,
        velocityKmS: Number.isFinite(velKmS) ? velKmS : null,
        risk: neo.is_potentially_hazardous_asteroid ? 'dangerous' : 'safe',
      };
    });
  }
}
