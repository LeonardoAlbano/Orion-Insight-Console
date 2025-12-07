import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { NeoObjectsPageComponent } from './neo-object-page.component';
import {
  NeoObjectsFacade,
  TableViewModel,
} from '../neo.objects.facade';

class NeoObjectsFacadeMock {
  viewModel$ = of<TableViewModel>({
    items: [
      {
        name: 'Asteroid 1',
        approachDate: '2025-12-07',
        missDistanceKm: 50000,
        velocityKmS: 25,
        risk: 'dangerous',
      },
    ],
    total: 1,
    page: 1,
    totalPages: 1,
    pageSize: 15,
    canPrev: false,
    canNext: false,
  });

  setRiskFilter(_: any): void {}
  setSearch(_: any): void {}
  setDaysFilter(_: any): void {}
  setPageSize(_: any): void {}
  goToPrevPage(): void {}
  goToNextPage(_: any): void {}
}

describe('NeoObjectsPageComponent', () => {
  let component: NeoObjectsPageComponent;
  let fixture: ComponentFixture<NeoObjectsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NeoObjectsPageComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: NeoObjectsFacade, useClass: NeoObjectsFacadeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NeoObjectsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve expor viewModel com itens paginados', (done) => {
    component.viewModel$.subscribe((vm) => {
      expect(vm.total).toBe(1);
      expect(vm.items.length).toBe(1);
      expect(vm.items[0].name).toBe('Asteroid 1');
      expect(vm.page).toBe(1);
      expect(vm.totalPages).toBe(1);
      done();
    });
  });
});
