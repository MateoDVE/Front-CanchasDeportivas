import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {


form = {
  email:'',
  password:''
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


},1000);


}



goHome(){

this.router.navigate([
''
]);

}



goRegister(){

this.router.navigate([
'register'
]);

}



goAdmin(){

this.router.navigate([
'admin-dashboard'
]);

}


}