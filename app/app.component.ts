import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs/observable/timer';
import { share, retry,concatMap,switchMap, map, tap, takeWhile } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

@Component({
  selector: 'my-app',
  template: `
    Bitcoin price: {{ data }}
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  polledBitcoin$: Observable<any>;

  data : number;

  private maxAttempts: number = 4;
  private attempts: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const bitcoin$ = this.http.get('https://blockchain.info/ticker');

    this.polledBitcoin$ = timer(0, 1000).pipe(
      tap(() => this.attempts++),
      tap(() => console.log('attempt count - ' + this.attempts)),
      switchMap(() => this.http.get('https://blockchain.info/ticker')),
      retry(),
      share(),
      takeWhile((response) => this.attempts < this.maxAttempts && response == null));
  }

  ngAfterViewInit(): void {
    this.polledBitcoin$.subscribe({
      next:(response) => {console.log(response)},
      error:(error) => {console.log(error)},
      complete:() => {console.log('complete')}
    });
  }
}
