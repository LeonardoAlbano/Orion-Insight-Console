import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { NeoObjectsPageComponent } from './neo-object-page.component';
import { NasaNeoService } from '../../../core/services/nasa-neo.service';
import type { NasaNeoObject } from '../../../core/validation/nasa-neo.schema';

class NasaNeoServiceMock {
  getObjectsRange(startDate: string, endDate: string) {
    const mockObjects: NasaNeoObject[] = [
      {
        id: '1',
        name: 'Asteroid 1',
        absolute_magnitude_h: 0,
        estimated_diameter: {} as any,
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: '2025-12-07',
            miss_distance: { kilometers: '50000' } as any,
            relative_velocity: { kilometers_per_second: '25' } as any,
          } as any,
        ],
        is_sentry_object: false,
        nasa_jpl_url: '',
        neo_reference_id: '',
      } as any,
    ];

    return of(mockObjects);
  }
}

describe('NeoObjectsPageComponent', () => {
  let component: NeoObjectsPageComponent;
  let fixture: ComponentFixture<NeoObjectsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeoObjectsPageComponent, HttpClientTestingModule],
      providers: [{ provide: NasaNeoService, useClass: NasaNeoServiceMock }],
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
