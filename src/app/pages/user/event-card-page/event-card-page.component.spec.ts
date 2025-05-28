import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCardPageComponent } from './event-card-page.component';

describe('EventCardPageComponent', () => {
  let component: EventCardPageComponent;
  let fixture: ComponentFixture<EventCardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
