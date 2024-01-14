import {Component, OnInit} from '@angular/core';
import {OrderHistory} from "../../common/order-history";
import {OrderHistoryService} from "../../services/order-history.service";

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orderHistories: OrderHistory[] = [];

  storage: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService) {
  }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  private handleOrderHistory() {
    const email = JSON.parse(this.storage.getItem('userEmail')!);
    this.orderHistoryService.getOrderHistory(email).subscribe(
      response => this.orderHistories = response._embedded.orders
    );
  }
}
