import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
selector:'app-booking-flow',
standalone:true,
imports:[
CommonModule,
FormsModule
],
templateUrl:'./booking-flow.html',
styleUrls:[
'./booking-flow.scss'
]
})
export class BookingFlowComponent {


step = 1;


form = {

name:'Carlos Mendoza',
phone:'+591 70123456',
email:'carlos@mail.com',
notes:''

};



court:any={

id:'c-1',
name:'Cancha Futsal A',
type:'Futsal',
pricePerHour:80,
images:[
'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800'
]

};



establishment:any={

name:'SportCenter Norte',
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

this.duration=Number(params['duration']) || 1;

this.totalPrice=Number(params['totalPrice']) || 80;

this.advance=Number(params['advance']) || 20;


});


}






getEndTime(){

const [h,m]=this.startTime.split(':').map(Number);

const total=h*60+m+this.duration*60;


return (

String(Math.floor(total/60))
.padStart(2,'0')

+':'+

String(total%60)
.padStart(2,'0')

);


}






continue(){

this.step=2;

}





back(){

this.step=1;

}





goPayment(){


this.router.navigate(

['/payment'],

{

queryParams:{

courtId:this.court.id,

date:this.date,

startTime:this.startTime,

duration:this.duration,

totalPrice:this.totalPrice,

advance:this.advance,

clientName:this.form.name,

clientPhone:this.form.phone,

clientEmail:this.form.email

}

}

);


}





goBack(){

this.router.navigate([
'/court-detail'
]);

}



}