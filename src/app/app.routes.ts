// import { Routes } from '@angular/router';
// import { HomeComponent } from './pages/home/home.component';
// import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
// import { RoomChatPageComponent } from './pages/room-chat-page/room-chat-page.component';
// // import {ManagementEventComponent} from './pages/admin/management-event/management-event.component';
// // import {CardRoomPageComponent} from './pages/card-room-page/card-room-page.component';
//
//
// import { SignInComponent } from './dialog/sign-in/sign-in.component';
// import { SignUpComponent } from './dialog/sign-up/sign-up.component';
// import { CreateRoomComponent } from './dialog/create-room/create-room.component';
// import { CreateEventComponent } from './dialog/create-event/create-event.component'; // ✅ Bổ sung import
//
// export const routes: Routes = [
//   { path: '', component: HomeComponent },
//   { path: 'profile', component: ProfilePageComponent },
//   { path: 'chat', component: RoomChatPageComponent },
//   { path: 'signin', component: SignInComponent },
//   { path: 'signup', component: SignUpComponent },
//   { path: 'create-room', component: CreateRoomComponent },
//   { path: 'create-event', component: CreateEventComponent }, // ✅ Bổ sung route mới
//
//   { path: '**', redirectTo: '' }
// ];



import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { RoomChatPageComponent } from './pages/room-chat-page/room-chat-page.component';
import { SignInComponent } from './dialog/sign-in/sign-in.component';
import { SignUpComponent } from './dialog/sign-up/sign-up.component';
import { CreateRoomComponent } from './dialog/create-room/create-room.component';
import { CreateEventComponent } from './dialog/create-event/create-event.component';
import { CardRoomPageComponent } from './pages/card-room-page/card-room-page.component'; // ✅

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'chat', component: RoomChatPageComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'create-room', component: CreateRoomComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'card-room', component: CardRoomPageComponent }, // ✅ Bổ sung route mới

  { path: '**', redirectTo: '' }
];
