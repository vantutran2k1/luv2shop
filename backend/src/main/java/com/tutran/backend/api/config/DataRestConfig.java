package com.tutran.backend.api.config;

import com.tutran.backend.api.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Configuration
public class DataRestConfig implements RepositoryRestConfigurer {
    @Value("${allowed.origins}")
    private String[] allowedOrigins;

    private EntityManager entityManager;

    @Autowired
    public DataRestConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        HttpMethod[] unsupportedMethods = {HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PATCH};
        disableHttpMethods(Product.class, config, unsupportedMethods);
        disableHttpMethods(ProductCategory.class, config, unsupportedMethods);
        disableHttpMethods(Country.class, config, unsupportedMethods);
        disableHttpMethods(State.class, config, unsupportedMethods);
        disableHttpMethods(Order.class, config, unsupportedMethods);

        exposeIds(config);

        cors.addMapping(config.getBasePath() + "/**").allowedOrigins(allowedOrigins);
    }

    private static void disableHttpMethods(Class<?> classType, RepositoryRestConfiguration config, HttpMethod[] unsupportedMethods) {
        config.getExposureConfiguration()
                .forDomainType(classType)
                .withItemExposure((metdata, httpMethods) -> httpMethods.disable(unsupportedMethods))
                .withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(unsupportedMethods));
    }

    private void exposeIds(RepositoryRestConfiguration config) {
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
        List<Class<?>> entityClasses = new ArrayList<>();
        for (var entityType : entities)
            entityClasses.add(entityType.getJavaType());

        Class<?>[] domainTypes = entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }
}
