import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentAssignmentModalComponent } from './agent-assignment-modal.component';

describe('AgentAssignmentModalComponent', () => {
  let component: AgentAssignmentModalComponent;
  let fixture: ComponentFixture<AgentAssignmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentAssignmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentAssignmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
