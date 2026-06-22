import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourSpotDashboardComponent } from './tour-spot-dashboard.component';

describe('TourSpotDashboardComponent', () => {
  let component: TourSpotDashboardComponent;
  let fixture: ComponentFixture<TourSpotDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourSpotDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourSpotDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
