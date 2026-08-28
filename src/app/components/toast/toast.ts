import {Component} from '@angular/core';



@Component({

selector:'app-toast',

standalone:true,

templateUrl:'./toast.html',

styleUrl:'./toast.scss'

})


export class ToastComponent {



messages:any[]=[];



show(
message:string,
type='success'
){


const id=Date.now();


this.messages.push({

id,

message,

type

});


setTimeout(()=>{


this.messages=
this.messages.filter(x=>x.id!==id);


},3500);


}



}