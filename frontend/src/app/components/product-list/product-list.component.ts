import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => this.listProducts());
    this.listProducts();
  }

  listProducts() {
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      const categoryId: number = +this.route.snapshot.paramMap.get('id')!;
      this.productService.getProductsByCategory(categoryId).subscribe(
        data => {
          this.products = data
        }
      );
    } else {
      this.productService.getAllProducts().subscribe(
        data => {
          this.products = data
        }
      );
    }
  }
}
