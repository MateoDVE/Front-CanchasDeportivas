import { Routes } from '@angular/router';

import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

import { CourtsComponent } from './pages/courts/courts';
import { CourtDetailComponent } from './pages/court-detail/court-detail';

import { BookingFlowComponent } from './pages/booking-flow/booking-flow';
import { PaymentComponent } from './pages/payment/payment';

import { BookingConfirmationComponent } 
from './pages/booking-confirmation/booking-confirmation';

import { MyReservationsComponent }
from './pages/my-reservations/my-reservations';

import { SecretaryDashboardComponent }
from './pages/secretary/secretary-dashboard';

import { AdminDashboardComponent }
from './pages/admin/admin-dashboard';

import { roleGuard } from './services/role.guard';

export const routes: Routes = [


{
 path:'',
 component:LandingComponent
},


{
 path:'login',
 component:LoginComponent
},


{
 path:'register',
 component:RegisterComponent
},


{
 path:'courts',
 component:CourtsComponent
},


{
 path:'court-detail/:id',
 component:CourtDetailComponent
},


{
 path:'booking-flow',
 component:BookingFlowComponent
},


{
 path:'payment',
 component:PaymentComponent
},


{
 path:'booking-confirmation',
 component:BookingConfirmationComponent
},


{
 path:'my-reservations',
 component:MyReservationsComponent
},

{
  path:'secretary',
  component:SecretaryDashboardComponent,
  canActivate: [roleGuard],
  data: { roles: ['SECRETARIA', 'ADMIN'] }
},

{
  path:'admin',
  component:AdminDashboardComponent,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
},


{
 path:'**',
 redirectTo:''
}


];