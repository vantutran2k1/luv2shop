import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Purchase} from "../common/purchase";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private purchaseUrl: string = environment.apiUrl + '/checkout/purchase';

  constructor(private httpClient: HttpClient) {
  }

  placeOrder(purchase: Purchase): Observable<PurchaseResponse> {
    return this.httpClient.post<PurchaseResponse>(this.purchaseUrl, purchase);
  }
}

interface PurchaseResponse {
  orderTrackingNumber: string
}
