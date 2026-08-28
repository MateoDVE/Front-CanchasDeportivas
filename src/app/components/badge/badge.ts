import {Component,Input} from '@angular/core';


type BadgeVariant =
'available'|
'confirmed'|
'pending'|
'pending-verification'|
'cancelled'|
'finished'|
'blocked'|
'paid'|
'rejected'|
'inactive';



@Component({

selector:'app-badge',

standalone:true,

templateUrl:'./badge.html',

styleUrl:'./badge.scss'

})


export class BadgeComponent {


@Input()
variant:BadgeVariant='pending';


@Input()
size:'sm'|'md'='md';



configs:any={


available:{
label:'Disponible',
class:'available'
},


confirmed:{
label:'Confirmada',
class:'confirmed'
},


pending:{
label:'Pendiente',
class:'pending'
},


cancelled:{
label:'Cancelada',
class:'cancelled'
},


finished:{
label:'Finalizada',
class:'finished'
},


paid:{
label:'Pagado',
class:'available'
},


rejected:{
label:'Rechazado',
class:'cancelled'
},


inactive:{
label:'Inactivo',
class:'finished'
},


blocked:{
label:'Bloqueada',
class:'blocked'
},


'pending-verification':{
label:'Pago en verificación',
class:'pending'
}


};



get data(){

return this.configs[this.variant];

}


}