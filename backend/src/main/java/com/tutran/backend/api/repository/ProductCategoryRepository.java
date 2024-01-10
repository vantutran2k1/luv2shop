package com.tutran.backend.api.repository;

import com.tutran.backend.api.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin("http://localhost:4200")
@RepositoryRestResource(path = "product-categories")
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
}