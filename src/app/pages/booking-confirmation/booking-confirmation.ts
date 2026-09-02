import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';


@Component({

selector:'app-booking-confirmation',

standalone:true,

imports:[
CommonModule
],

templateUrl:'./booking-confirmation.html',

styleUrls:[
'./booking-confirmation.scss'
]

})
export class BookingConfirmationComponent {



reservationId =
'R-' + Math.floor(Math.random()*900+100);



court={

name:'Cancha Futsal A',

type:'Futsal'

};



establishment={

name:'SportCenter Norte',

address:'Av. Principal',

city:'La Paz'

};



date='2026-08-20';

startTime='10:00';

duration=1;


totalPrice=80;

advance=20;



constructor(

private router:Router,

private route:ActivatedRoute

){


this.route.queryParams.subscribe(params=>{


this.date=params['date'] || this.date;

this.startTime=params['startTime'] || this.startTime;


});


}






getEndTime(){


const [h,m]=this.startTime
.split(':')
.map(Number);


const total=h*60+m+this.duration*60;


return (

String(Math.floor(total/60))
.padStart(2,'0')

+

':'

+

String(total%60)
.padStart(2,'0')

);


}






goReservations(){

this.router.navigate([
'/my-reservations'
]);

}





goHome(){

this.router.navigate([
''
]);

}



}