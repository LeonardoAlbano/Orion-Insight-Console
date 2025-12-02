import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  PoTableModule,
  PoTableColumn,
  PoLoadingModule,
} from '@po-ui/ng-components';
import { catchError, map, of } from 'rxjs';

import { NasaNeoService } from '../../../core/services/nasa-neo.service';
import type { NasaNeoObject } from '../../../core/validation/nasa-neo.schema';

// Modelo que a tabela usa
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
  imports: [CommonModule, AsyncPipe, PoTableModule, PoLoadingModule],
  templateUrl: './neo-object-page.component.html',
  styleUrls: ['./neo-object-page.component.scss'],
})
export class NeoObjectsPageComponent {
  private readonly neoService = inject(NasaNeoService);

  readonly columns: PoTableColumn[] = [
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

  readonly neoItems$ = this.neoService.getTodayObjects().pipe(
    map((objects) => this.mapToTableItems(objects)),
    catchError((err) => {
      console.error('Erro ao carregar Near Earth Objects', err);
      return of<NeoTableItem[]>([]);
    }),
  );

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
