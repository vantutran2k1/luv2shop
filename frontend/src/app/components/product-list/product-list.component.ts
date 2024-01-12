import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../common/cart-item";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  hasCategoryId: boolean = false;
  previousCategoryId: number = 0;
  currentCategoryId: number = 0;
  currentCategoryName: string = '';

  hasKeyword: boolean = false;
  previousKeyword: string = '';
  currentKeyword: string = '';

  pageNumber: number = 1;
  pageSize: number = 5;
  totalElements: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {
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

  updatePageSize(pageSize: string) {
    this.pageSize = +pageSize;
    this.pageNumber = 1;
    this.listProducts();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(new CartItem(product));
  }

  private listAllProducts() {
    this.productService.getAllProducts(
      this.pageNumber - 1,
      this.pageSize
    ).subscribe(this.processProductsResult());
  }

  private listProductsByKeyword() {
    this.currentKeyword = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != this.currentKeyword)
      this.pageNumber = 1;
    this.previousKeyword = this.currentKeyword;

    this.productService.getProductsByNameContainingKeyword(
      this.currentKeyword,
      this.pageNumber - 1,
      this.pageSize
    ).subscribe(this.processProductsResult());
  }

  private listProductsByCategory() {
    this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getCategoryById(this.currentCategoryId).subscribe(
      category => this.currentCategoryName = category.categoryName
    );

    if (this.previousCategoryId != this.currentCategoryId)
      this.pageNumber = 1;
    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductsByCategoryId(
      this.currentCategoryId,
      this.pageNumber - 1,
      this.pageSize
    ).subscribe(this.processProductsResult());
  }

  private processProductsResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalElements = data.page.totalElements;
    }
  }
}
