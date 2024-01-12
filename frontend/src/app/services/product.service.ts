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

  getProductById(productId: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.productBaseUrl}/${productId}`);
  }

  getAllProducts(pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    const searchUrl: string = `${this.productBaseUrl}?page=${pageNumber}&size=${pageSize}`
    return this.getResponseProductsFromUrl(searchUrl);
  }

  getProductsByCategoryId(categoryId: number, pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    const searchUrl: string = `${this.productBaseUrl}/search/findByCategoryId?id=${categoryId}`
      + `&page=${pageNumber}&size=${pageSize}`;
    return this.getResponseProductsFromUrl(searchUrl);
  }

  getProductsByNameContainingKeyword(keyword: string, pageNumber: number, pageSize: number): Observable<GetResponseProducts> {
    const searchUrl: string = `${this.productBaseUrl}/search/findByNameContaining?name=${keyword}`
      + `&page=${pageNumber}&size=${pageSize}`;
    return this.getResponseProductsFromUrl(searchUrl);
  }

  getCategoryById(categoryId: number): Observable<ProductCategory> {
    return this.httpClient.get<ProductCategory>(`${this.categoryBaseUrl}/${categoryId}`);
  }

  getAllCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryBaseUrl).pipe(
      map(response => response._embedded.productCategories)
    );
  }

  private getResponseProductsFromUrl(searchUrl: string): Observable<GetResponseProducts> {
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategories: ProductCategory[];
  }
}
