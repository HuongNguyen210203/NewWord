import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { RoomChatPageComponent } from './pages/room-chat-page/room-chat-page.component';
import { CardRoomPageComponent } from './pages/card-room-page/card-room-page.component';
import {ManagementEventComponent} from './pages/admin/management-event/management-event.component';
import { ManagementProfileComponent } from './pages/admin/management-profile/management-profile.component';
import  { ManagementRoomComponent } from './pages/admin/management-room/management-room.component';

import { SignInComponent } from './dialog/sign-in/sign-in.component';
import { SignUpComponent } from './dialog/sign-up/sign-up.component';
import { CreateRoomComponent } from './dialog/create-room/create-room.component';
import { CreateEventComponent } from './dialog/create-event/create-event.component';
import {AdminPageComponent} from './pages/admin/admin-page/admin-page.component';
import {DashboardComponent} from './pages/admin/admin-page/components/dashboard/dashboard.component';


export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'chat', component: RoomChatPageComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'create-room', component: CreateRoomComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'card-room', component: CardRoomPageComponent },

  // Route admin layout chứa children
  {
    path: 'admin',
    component: AdminPageComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'management-event', component: ManagementEventComponent },
      { path: 'management-profile', component: ManagementProfileComponent },
      { path: 'management-room', component: ManagementRoomComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
