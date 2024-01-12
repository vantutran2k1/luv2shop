import {Component, OnInit} from '@angular/core';
import {Product} from "../../common/product";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../common/cart-item";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product!: Product;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      () => this.handleProductDetails()
    );
  }

  handleProductDetails() {
    const productId: number = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(productId).subscribe(
      product => this.product = product
    );
  }

  addToCart() {
    this.cartService.addToCart(new CartItem(this.product));
  }
}
