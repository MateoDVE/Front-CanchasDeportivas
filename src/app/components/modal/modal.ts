import {Component,Input,Output,EventEmitter} from '@angular/core';


@Component({

selector:'app-modal',

standalone:true,

templateUrl:'./modal.html',

styleUrl:'./modal.scss'

})


export class ModalComponent {


@Input()
open=false;


@Input()
title='';



@Output()
close=new EventEmitter();



closeModal(){

this.close.emit();

}


}