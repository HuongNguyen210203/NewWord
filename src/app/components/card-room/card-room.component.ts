import {Component, Input} from '@angular/core';
import {MaterialModule} from '../../modules/material/material.module';
import {ChatRoom} from '../../../Models/chat-room.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-card-room',
  imports: [MaterialModule],
  standalone: true,
  templateUrl: './card-room.component.html',
  styleUrl: './card-room.component.css'
})
export class CardRoomComponent {
  @Input() room!: ChatRoom;
  constructor(private router: Router) {}

  goToChatRoom() {
    this.router.navigate(['/chat'], { state: { room: this.room } });
  }
}
