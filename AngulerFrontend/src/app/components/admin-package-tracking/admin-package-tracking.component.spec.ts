import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPackageTrackingComponent } from './admin-package-tracking.component';

describe('AdminPackageTrackingComponent', () => {
  let component: AdminPackageTrackingComponent;
  let fixture: ComponentFixture<AdminPackageTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPackageTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPackageTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
