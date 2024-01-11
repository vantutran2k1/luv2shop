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

  hasCategoryId: boolean = false;
  currentCategoryId: number = 0;
  currentCategoryName: string = '';

  hasKeyword: boolean = false;
  currentKeyword: string = '';

  constructor(private productService: ProductService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => this.listProducts());
    this.listProducts();
  }

  listProducts() {
    this.hasCategoryId = this.route.snapshot.paramMap.has('id');
    this.hasKeyword = this.route.snapshot.paramMap.has('keyword');

    if (this.hasCategoryId)
      this.listProductsByCategory();
    else if (this.hasKeyword)
      this.listProductsByKeyword();
    else
      this.listAllProducts();
  }

  private listAllProducts() {
    this.productService.getAllProducts().subscribe(
      products => this.products = products
    );
  }

  private listProductsByKeyword() {
    this.currentKeyword = this.route.snapshot.paramMap.get('keyword')!;

    this.productService.getProductsByNameContainingKeyword(this.currentKeyword).subscribe(
      products => this.products = products
    );
  }

  private listProductsByCategory() {
    this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getCategoryById(this.currentCategoryId).subscribe(
      category => this.currentCategoryName = category.categoryName
    );

    this.productService.getProductsByCategoryId(this.currentCategoryId).subscribe(
      products => this.products = products
    );
  }
}
