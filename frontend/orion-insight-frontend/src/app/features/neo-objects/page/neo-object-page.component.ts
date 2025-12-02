import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PoTableModule,
  PoTableColumn,
  PoLoadingModule,
} from '@po-ui/ng-components';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
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

@Component({
  selector: 'app-neo-objects-page',
  standalone: true,
  imports: [CommonModule, PoTableModule, PoLoadingModule],
  templateUrl: './neo-object-page.component.html',
  styleUrls: ['./neo-object-page.component.scss'],
})
export class NeoObjectsPageComponent {
  private readonly neoService = inject(NasaNeoService);
  private readonly searchTerm$ = new BehaviorSubject<string>('');
  private readonly riskFilter$ =
    new BehaviorSubject<'all' | 'dangerous' | 'safe'>('all');

  // Colunas da tabela do PO-UI
  readonly columns: PoTableColumn[] = [
    {
      property: 'name',
      label: 'Objeto',
      width: '20%',
      sortable: true,
    },
    {
      property: 'approachDate',
      label: 'Data de aproximação',
      type: 'date',
      width: '18%',
      sortable: true,
    },
    {
      property: 'missDistanceKm',
      label: 'Distância (km)',
      type: 'number',
      format: '1.0-0',
      width: '20%',
      sortable: true,
    },
    {
      property: 'velocityKmS',
      label: 'Velocidade (km/s)',
      type: 'number',
      format: '1.1-1',
      width: '20%',
      sortable: true,
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

  private readonly neoItems$ = this.neoService.getTodayObjects().pipe(
    map((objects) => this.mapToTableItems(objects)),
    catchError((err) => {
      console.error('Erro ao carregar Near Earth Objects', err);
      return of<NeoTableItem[]>([]);
    }),
  );

  readonly filteredItems$ = combineLatest([
    this.neoItems$,
    this.searchTerm$,
    this.riskFilter$,
  ]).pipe(
    map(([items, searchTerm, riskFilter]) => {
      const term = searchTerm.trim().toLowerCase();

      return items.filter((item) => {
        const matchesRisk =
          riskFilter === 'all' ? true : item.risk === riskFilter;

        const matchesSearch =
          !term ||
          item.name.toLowerCase().includes(term) ||
          item.approachDate.includes(term);

        return matchesRisk && matchesSearch;
      });
    }),
  );

  onSearchChange(value: string) {
    this.searchTerm$.next(value);
  }

  onRiskFilterChange(value: string) {
    const cast = value as 'all' | 'dangerous' | 'safe';
    this.riskFilter$.next(cast);
  }

  private mapToTableItems(objects: NasaNeoObject[]): NeoTableItem[] {
    return objects.map((neo) => {
      const firstApproach = neo.close_approach_data[0];

      const missKm = firstApproach
        ? parseFloat(firstApproach.miss_distance.kilometers)
        : null;

      const velKmS = firstApproach
        ? parseFloat(firstApproach.relative_velocity.kilometers_per_second)
        : null;

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
