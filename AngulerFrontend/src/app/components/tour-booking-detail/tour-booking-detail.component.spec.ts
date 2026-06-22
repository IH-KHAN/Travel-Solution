import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourBookingDetailComponent } from './tour-booking-detail.component';

describe('TourBookingDetailComponent', () => {
  let component: TourBookingDetailComponent;
  let fixture: ComponentFixture<TourBookingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourBookingDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
