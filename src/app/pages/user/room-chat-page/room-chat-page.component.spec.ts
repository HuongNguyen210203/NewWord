import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomChatPageComponent } from './room-chat-page.component';

describe('RoomChatPageComponent', () => {
  let component: RoomChatPageComponent;
  let fixture: ComponentFixture<RoomChatPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomChatPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomChatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
