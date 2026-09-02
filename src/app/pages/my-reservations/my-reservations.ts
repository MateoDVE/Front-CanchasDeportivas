import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './my-reservations.html',
  styleUrls: ['./my-reservations.scss']
})
export class MyReservationsComponent {


  activeFilter = 'all';

  cancelId:string | null = null;

  selectedReservation:any = null;

  showCancelModal=false;



  filters = [

    {
      key:'all',
      label:'Todas'
    },

    {
      key:'confirmed',
      label:'Confirmadas'
    },

    {
      key:'pending',
      label:'Pendientes'
    },

    {
      key:'finished',
      label:'Finalizadas'
    },

    {
      key:'cancelled',
      label:'Canceladas'
    }

  ];



  reservations=[


    {
      id:'R-101',
      court:'Cancha Futsal A',
      establishment:'SportCenter Norte',
      date:'2026-08-20',
      startTime:'10:00',
      durationHours:1,
      totalPrice:80,
      advanceAmount:20,
      reservationStatus:'pending',
      paymentStatus:'pending',
      image:'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600'
    },


    {
      id:'R-102',
      court:'Cancha Pádel Pro',
      establishment:'Arena Deportiva',
      date:'2026-08-10',
      startTime:'18:00',
      durationHours:2,
      totalPrice:240,
      advanceAmount:60,
      reservationStatus:'confirmed',
      paymentStatus:'paid',
      image:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600'
    },


    {
      id:'R-103',
      court:'Cancha Vóley Premium',
      establishment:'Arena Deportiva',
      date:'2026-07-30',
      startTime:'16:00',
      durationHours:1,
      totalPrice:60,
      advanceAmount:15,
      reservationStatus:'finished',
      paymentStatus:'paid',
      image:'https://images.unsplash.com/photo-1518605368461-0b5d2a7f9f4d?w=600'
    }

  ];



  constructor(
    private router:Router
  ){}



  get visibleReservations(){

    return this.reservations.filter(r=>{

      if(this.activeFilter==='all'){
        return true;
      }

      return r.reservationStatus === this.activeFilter;

    });

  }



  changeFilter(filter:string){

    this.activeFilter=filter;

  }



  getEndTime(
    start:string,
    duration:number
  ){

    const [h,m]=start.split(':').map(Number);


    const total =
    h*60+m+(duration*60);


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



  openCancel(reservation:any){

    this.selectedReservation=reservation;

    this.showCancelModal=true;

  }



  closeModal(){

    this.selectedReservation=null;

    this.showCancelModal=false;

  }



  cancelReservation(){

    if(this.selectedReservation){

      this.selectedReservation.reservationStatus='cancelled';

    }


    this.closeModal();

  }



  newReservation(){

    this.router.navigate([
      '/courts'
    ]);

  }



  goDetail(id:string){

    this.router.navigate([
      '/court-detail',
      id
    ]);

  }
}