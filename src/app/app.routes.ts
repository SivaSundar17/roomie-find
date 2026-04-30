import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { CreateProfileComponent } from './pages/create-profile/create-profile.component';
import { BrowseProfilesComponent } from './pages/browse-profiles/browse-profiles.component';
import { ConnectionsComponent } from './pages/connections/connections.component';
import { MyListingsComponent } from './pages/my-listings/my-listings.component';
import { BrowseListingsComponent } from './pages/browse-listings/browse-listings.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'edit-profile', component: CreateProfileComponent },
  { path: 'browse-profiles', component: BrowseProfilesComponent },
  { path: 'my-connections', component: ConnectionsComponent },
  { path: 'my-listings', component: MyListingsComponent },
  { path: 'browse-listings', component: BrowseListingsComponent },
  { path: 'chat/:userId', component: ChatComponent },
  { path: 'create-profile', redirectTo: 'sign-up' }, // Redirect old URL
  { path: '**', redirectTo: '' }
];
