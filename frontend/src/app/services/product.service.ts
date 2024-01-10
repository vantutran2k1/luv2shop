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
    return this.httpClient.get<GetResponseProducts>(this.productBaseUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProductsByCategoryId(categoryId: number): Observable<Product[]> {
    const searchUrl = `${this.productBaseUrl}/search/findByCategoryId?id=${categoryId}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getCategoryById(categoryId: number): Observable<ProductCategory> {
    const searchUrl = `${this.categoryBaseUrl}/${categoryId}`;
    return this.httpClient.get<ProductCategory>(searchUrl);
  }

  getAllCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryBaseUrl).pipe(
      map(response => response._embedded.productCategories)
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
