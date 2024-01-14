package com.tutran.backend.api.repository;

import com.tutran.backend.api.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface CountryRepository extends JpaRepository<Country, Integer> {
}
