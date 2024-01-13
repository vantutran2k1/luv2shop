import {Injectable} from '@angular/core';
import {CartItem} from "../common/cart-item";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() {
  }

  addToCart(cartItem: CartItem) {
    const item = this.cartItems.find(item => item.id === cartItem.id);
    if (item !== undefined)
      item.quantity++;
    else
      this.cartItems.push(cartItem);

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let item of this.cartItems) {
      totalPriceValue += item.quantity * item.unitPrice;
      totalQuantityValue += item.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }

  decrementQuantity(item: CartItem) {
    item.quantity--;
    if (item.quantity === 0)
      this.remove(item);
    else
      this.computeCartTotals();
  }

  remove(item: CartItem) {
    const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
      this.computeCartTotals();
    }
  }
}