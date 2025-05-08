import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

// Angular Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-create-room',
  standalone: true,
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css'],
  imports: [
    FormsModule,
    NgFor,

    // Angular Material
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class CreateRoomComponent {
  imagePreview: string | ArrayBuffer | null = null;

  room = {
    description: '',
    event: '',
    people: ''
  };

  peopleOptions = ['5', '10', '20', '50', 'Unlimited'];

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  createRoom() {
    console.log('Room created:', this.room);
    alert('Chat room created!');
  }
}
