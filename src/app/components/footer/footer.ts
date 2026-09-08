import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


@Component({

selector:'app-footer',

standalone:true,
imports: [RouterLink],

templateUrl:'./footer.html',

styleUrl:'./footer.scss'

})


export class FooterComponent {
  year = new Date().getFullYear();


constructor(
private router:Router
){}



navigate(page:string){

if(page==='landing'){

this.router.navigate(['/']);

}

}


}