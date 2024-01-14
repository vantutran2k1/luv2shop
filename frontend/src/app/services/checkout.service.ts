import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Purchase} from "../common/purchase";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {PaymentInfo} from "../common/payment-info";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private purchaseUrl: string = environment.apiUrl + '/checkout/purchase';
  private paymentIntentUrl: string = environment.apiUrl + '/checkout/payment-intent';

  constructor(private httpClient: HttpClient) {
  }

  placeOrder(purchase: Purchase): Observable<PurchaseResponse> {
    return this.httpClient.post<PurchaseResponse>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}

interface PurchaseResponse {
  orderTrackingNumber: string
}
