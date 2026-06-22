import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourPackageListComponent } from './tour-package-list.component';

describe('TourPackageListComponent', () => {
  let component: TourPackageListComponent;
  let fixture: ComponentFixture<TourPackageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourPackageListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourPackageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
