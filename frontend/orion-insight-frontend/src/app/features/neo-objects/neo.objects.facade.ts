import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';

import { NasaNeoService } from '../../core/services/nasa-neo.service';
import type { NasaNeoObject } from '../../core/validation/nasa-neo.schema';

export type NeoTableItem = {
  name: string;
  approachDate: string;
  missDistanceKm: number | null;
  velocityKmS: number | null;
  risk: 'dangerous' | 'safe';
};

export type RiskFilter = 'all' | 'dangerous' | 'safe';
export type DaysFilter = 1 | 3 | 7;

export type TableViewModel = {
  items: NeoTableItem[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  canPrev: boolean;
  canNext: boolean;
};

@Injectable({ providedIn: 'root' })
export class NeoObjectsFacade {
  private readonly neoService = inject(NasaNeoService);

  private readonly daysFilterSubject = new BehaviorSubject<DaysFilter>(1);
  private readonly riskFilterSubject = new BehaviorSubject<RiskFilter>('all');
  private readonly searchFilterSubject = new BehaviorSubject<string>('');

  private readonly daysFilter$ = this.daysFilterSubject.asObservable();
  private readonly riskFilter$ = this.riskFilterSubject.asObservable();
  private readonly searchFilter$ = this.searchFilterSubject.asObservable();

  private readonly pageSubject = new BehaviorSubject<number>(1);
  private readonly pageSizeSubject = new BehaviorSubject<number>(15);

  private readonly page$ = this.pageSubject.asObservable();
  private readonly pageSize$ = this.pageSizeSubject.asObservable();

  private readonly baseItems$: Observable<NeoTableItem[]> = this.daysFilter$.pipe(
    switchMap((days) => this.loadRange(days)),
    shareReplay(1),
  );

  private readonly filteredItems$ = combineLatest([
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

  readonly viewModel$: Observable<TableViewModel> = combineLatest([
    this.filteredItems$,
    this.page$,
    this.pageSize$,
  ]).pipe(
    map(([items, page, pageSize]) => {
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const safePage = Math.min(Math.max(page, 1), totalPages);

      const startIndex = (safePage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageItems = items.slice(startIndex, endIndex);

      const vm: TableViewModel = {
        items: pageItems,
        total,
        page: safePage,
        totalPages,
        pageSize,
        canPrev: safePage > 1,
        canNext: safePage < totalPages,
      };

      return vm;
    }),
  );

  // --------- Ações chamadas pelo componente ---------

  setRiskFilter(value: RiskFilter): void {
    this.riskFilterSubject.next(value);
    this.pageSubject.next(1);
  }

  setSearch(value: string): void {
    this.searchFilterSubject.next(value);
    this.pageSubject.next(1);
  }

  setDaysFilter(value: DaysFilter): void {
    this.daysFilterSubject.next(value);
    this.pageSubject.next(1);
  }

  setPageSize(size: number): void {
    if (!Number.isFinite(size) || size <= 0) return;

    this.pageSizeSubject.next(size);
    this.pageSubject.next(1);
  }

  goToPrevPage(): void {
    const current = this.pageSubject.value;
    if (current > 1) {
      this.pageSubject.next(current - 1);
    }
  }

  goToNextPage(totalPages: number): void {
    const current = this.pageSubject.value;
    if (current < totalPages) {
      this.pageSubject.next(current + 1);
    }
  }

  // --------- Helpers internos ---------

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

  private mapToTableItems(neos: NasaNeoObject[]): NeoTableItem[] {
    return neos.map((neo) => {
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
