import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRoomPageComponent } from './card-room-page.component';

describe('CardRoomPageComponent', () => {
  let component: CardRoomPageComponent;
  let fixture: ComponentFixture<CardRoomPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRoomPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRoomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
