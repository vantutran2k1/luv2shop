import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Product} from "../common/product";
import {ProductCategory} from "../common/product-category";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productBaseUrl = 'http://localhost:8080/api/products';
  private categoryBaseUrl = 'http://localhost:8080/api/product-categories';

  constructor(private httpClient: HttpClient) {
  }

  getAllProducts(): Observable<Product[]> {
    return this.getProductsFromUrl(this.productBaseUrl);
  }

  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    return this.getProductsFromUrl(`${this.productBaseUrl}/search/findByCategoryId?id=${categoryId}`);
  }

  getProductsByNameContainingKeyword(keyword: string): Observable<Product[]> {
    return this.getProductsFromUrl(`${this.productBaseUrl}/search/findByNameContaining?name=${keyword}`);
  }

  getCategoryById(categoryId: number): Observable<ProductCategory> {
    return this.httpClient.get<ProductCategory>(`${this.categoryBaseUrl}/${categoryId}`);
  }

  getAllCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryBaseUrl).pipe(
      map(response => response._embedded.productCategories)
    );
  }

  private getProductsFromUrl(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategories: ProductCategory[];
  }
}
