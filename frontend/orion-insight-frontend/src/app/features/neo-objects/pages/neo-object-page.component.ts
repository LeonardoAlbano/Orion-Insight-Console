import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PoLoadingModule,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';

import {
  NeoObjectsFacade,
  RiskFilter,
  DaysFilter,
} from '../neo.objects.facade';

@Component({
  selector: 'app-neo-objects-page',
  standalone: true,
  imports: [CommonModule, PoTableModule, PoLoadingModule],
  templateUrl: './neo-object-page.component.html',
  styleUrls: ['./neo-object-page.component.scss'],
})
export class NeoObjectsPageComponent {
  private readonly facade = inject(NeoObjectsFacade);
  readonly viewModel$ = this.facade.viewModel$;

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


  onRiskFilterChange(value: RiskFilter): void {
    this.facade.setRiskFilter(value);
  }

  onSearchChange(value: string): void {
    this.facade.setSearch(value);
  }

  onDaysFilterChange(value: string): void {
    const days = Number(value) as DaysFilter;
    if (days === 1 || days === 3 || days === 7) {
      this.facade.setDaysFilter(days);
    }
  }

  onPageSizeChange(value: string): void {
    const size = Number(value);
    this.facade.setPageSize(size);
  }

  goToPrevPage(): void {
    this.facade.goToPrevPage();
  }

  goToNextPage(totalPages: number): void {
    this.facade.goToNextPage(totalPages);
  }

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
}
