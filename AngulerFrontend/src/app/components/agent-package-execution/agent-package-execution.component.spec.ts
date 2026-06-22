import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPackageExecutionComponent } from './agent-package-execution.component';

describe('AgentPackageExecutionComponent', () => {
  let component: AgentPackageExecutionComponent;
  let fixture: ComponentFixture<AgentPackageExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentPackageExecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPackageExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
