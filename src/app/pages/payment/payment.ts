import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';


@Component({

selector:'app-payment',

standalone:true,

imports:[

CommonModule,
FormsModule

],

templateUrl:'./payment.html',

styleUrls:['./payment.scss']

})
export class PaymentComponent {



paymentMethod='QR';


reference='';

amount='';

payDate='2026-08-19';


fileName='';


submitted=false;


loading=false;



court:any={

id:'c-1',

name:'Cancha Futsal A'

};



establishment:any={

name:'SportCenter Norte'

};



date='2026-08-20';

startTime='10:00';

duration=1;


totalPrice=80;


advance=20;



methods=[

{
id:'QR',
label:'Pago QR',
icon:'📱'
},

{
id:'transfer',
label:'Transferencia',
icon:'🏦'
},

{
id:'cash',
label:'Efectivo',
icon:'💵'
}

];





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


const [h,m]=this.startTime
.split(':')
.map(Number);



const total =
h*60+m+
this.duration*60;



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






submitPayment(){


this.loading=true;


setTimeout(()=>{


this.loading=false;

this.submitted=true;



},1500);


}







selectFile(event:any){


const file =
event.target.files[0];


if(file){

this.fileName=file.name;

}


}





goConfirmation(){



this.router.navigate(

['/booking-confirmation'],

{

queryParams:{


courtId:this.court.id,

date:this.date,

startTime:this.startTime,

duration:this.duration,

totalPrice:this.totalPrice,

advance:this.advance

}

}

);


}






goReservations(){


this.router.navigate([
'/my-reservations'
]);


}







goBack(){


this.router.navigate([
'/booking-flow'
]);


}



}