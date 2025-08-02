import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoomDialogComponent } from './edit-room-dialog.component';
describe('EditRoomDialogComponent', () => {
  let component: EditRoomDialogComponent;
  let fixture: ComponentFixture<EditRoomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoomDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
