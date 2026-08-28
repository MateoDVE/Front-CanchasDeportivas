import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({

selector:'app-footer',

standalone:true,

templateUrl:'./footer.html',

styleUrl:'./footer.scss'

})


export class FooterComponent {


constructor(
private router:Router
){}



navigate(page:string){

if(page==='landing'){

this.router.navigate(['/']);

}

}


}