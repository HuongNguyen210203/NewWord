import { Routes } from '@angular/router';
import { HomeComponent } from './pages/user/home/home.component';
import { ProfilePageComponent } from './pages/user/profile-page/profile-page.component';
import { RoomChatPageComponent } from './pages/user/room-chat-page/room-chat-page.component';
import { CardRoomPageComponent } from './pages/user/card-room-page/card-room-page.component';
import { EventRoomPageComponent } from './pages/user/event-room-page/event-room-page.component';
import {ManagementEventComponent} from './pages/admin/management-event/management-event.component';
import { ManagementProfileComponent } from './pages/admin/management-profile/management-profile.component';
import  { ManagementRoomComponent } from './pages/admin/management-room/management-room.component';

import { SignInComponent } from './dialog/sign-in/sign-in.component';
import { SignUpComponent } from './dialog/sign-up/sign-up.component';
import { CreateRoomComponent } from './dialog/create-room/create-room.component';
import { CreateEventComponent } from './dialog/create-event/create-event.component';
import {AdminPageComponent} from './pages/admin/admin-page/admin-page.component';
import {DashboardComponent} from './pages/admin/admin-page/components/dashboard/dashboard.component';
import {UserLayoutComponent} from './pages/user/user-layout/user-layout.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest-guard.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: SignInComponent, canActivate: [GuestGuard] },
  { path: 'signup', component: SignUpComponent, canActivate: [GuestGuard] },

  // Route user layout chứa children
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [AuthGuard], // ⬅️ bảo vệ toàn bộ user layout
    children: [
      {
        path: 'home',
        children: [
          { path: '', component: HomeComponent },
          { path: 'event-room-page', component: EventRoomPageComponent },
          { path: 'card-room', component: CardRoomPageComponent }
        ]
      },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'chat', component: RoomChatPageComponent },
      { path: 'create-room', component: CreateRoomComponent },
      { path: 'create-event', component: CreateEventComponent },
    ]
  },


  // Route admin layout chứa children
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [AdminGuard], // ✅ Chặn người không phải admin
    children: [
      { path: '', component: DashboardComponent },
      { path: 'management-event', component: ManagementEventComponent },
      { path: 'management-profile', component: ManagementProfileComponent },
      { path: 'management-room', component: ManagementRoomComponent },
    ]
  },

  { path: '**', redirectTo: '/home' }
];
