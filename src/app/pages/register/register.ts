import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  standalone:true,
  imports:[
    CommonModule,
    FormsModule
  ],
  templateUrl:'./register.html',
  styleUrls:['./register.scss']
})
export class RegisterComponent {


form = {

name:'',
phone:'',
email:'',
password:'',
confirmPassword:''

};


loading=false;



constructor(
private router:Router
){}



handleSubmit(){

this.loading=true;


setTimeout(()=>{

this.loading=false;

this.router.navigate([
'my-reservations'
]);


},1200);


}



goHome(){

this.router.navigate([
''
]);

}



goLogin(){

this.router.navigate([
'login'
]);

}



}