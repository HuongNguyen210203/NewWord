import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRoomPageComponent } from './event-room-page.component';

describe('EventCardPageComponent', () => {
  let component: EventRoomPageComponent;
  let fixture: ComponentFixture<EventRoomPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRoomPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventRoomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
