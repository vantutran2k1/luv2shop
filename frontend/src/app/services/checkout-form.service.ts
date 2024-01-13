import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CheckoutFormService {

  constructor() {
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    const months: number[] = [];
    for (let month = startMonth; month <= 12; month++)
      months.push(month);

    return of(months);
  }

  getCreditCardYears(): Observable<number[]> {
    const years: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let year = startYear; year <= endYear; year++)
      years.push(year);

    return of(years);


  }
}
