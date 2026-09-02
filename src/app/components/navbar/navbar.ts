import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({

selector:'app-navbar',

standalone:true,

templateUrl:'./navbar.html',

styleUrl:'./navbar.scss'

})


export class NavbarComponent {


@Input() currentPage:string='landing';

@Input() isLoggedIn:boolean=false;



mobileOpen=false;



constructor(
private router:Router
){}



navigate(page:string){

this.mobileOpen=false;


switch(page){


case 'landing':

this.router.navigate(['/']);

break;



case 'courts':

this.router.navigate(['/courts']);

break;



case 'login':

this.router.navigate(['/login']);

break;



case 'my-reservations':

if(this.isLoggedIn){

this.router.navigate(['/my-reservations']);

}else{

this.router.navigate(['/login']);

}

break;


}



}


}