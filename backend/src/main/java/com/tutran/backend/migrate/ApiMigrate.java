package com.tutran.backend.migrate;

import lombok.extern.log4j.Log4j2;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.MigrationInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication()
@ComponentScan(
        basePackages = "com.tutran.backend.migrate",
        excludeFilters = @ComponentScan.Filter(SpringBootApplication.class)
)
@Log4j2
public class ApiMigrate implements ApplicationRunner {
    private final DataSource dataSource;

    @Autowired
    public ApiMigrate(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static void main(String[] args) {
        new SpringApplicationBuilder(ApiMigrate.class)
                .web(WebApplicationType.NONE)
                .run(args);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info(args.getOptionNames());
        List<String> optionValues = args.getOptionValues("action");
        if (optionValues != null && optionValues.size() == 1) {
            String action = optionValues.getFirst().toLowerCase();
            Flyway flyway = flyway();
            switch (action) {
                case "migrate":
                    try {
                        flyway.migrate();
                        log.info("migrate success");
                    } catch (FlywayException ex) {
                        ex.printStackTrace();
                    }
                    return;
                case "info":
                    MigrationInfoService info = flyway.info();
                    Arrays.stream(info.all()).forEach(a -> {
                        log.info("Version: " + a.getVersion());
                        log.info("\tDescription: " + a.getDescription());
                        log.info("\tScript: " + a.getScript());
                        log.info("\tState: " + a.getState());
                    });
                    return;
                case "validate":
                    try {
                        flyway.validate();
                        log.info("Validate ok");
                    } catch (FlywayException ex) {
                        log.error("validate", ex);
                    }
                    return;

                default:
                    log.error("action " + action + " do not support");
                    return;
            }

        }
        log.error("Must pass action to migrate");
    }

    @Bean
    Flyway flyway() {
        return Flyway.configure().dataSource(this.dataSource).load();
    }
}

