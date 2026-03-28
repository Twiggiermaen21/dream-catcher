package com.dreamcatcher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(ApplicationStartupLogger.class);

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:}")
    private String datasourceUsername;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.jpa.hibernate.ddl-auto}")
    private String ddlAuto;

    @Value("${spring.jpa.show-sql}")
    private boolean showSql;

    @Value("${server.port}")
    private int serverPort;

    @EventListener(ApplicationReadyEvent.class)
    public void logDatabaseConfig() {
        log.info("=== Database Configuration ===");
        log.info("  URL:        {}", datasourceUrl);
        log.info("  Username:   {}", datasourceUsername.isBlank() ? "<not set>" : datasourceUsername);
        log.info("  Driver:     {}", driverClassName);
        log.info("  DDL Auto:   {}", ddlAuto);
        log.info("  Show SQL:   {}", showSql);
        log.info("  Server port:{}", serverPort);
        log.info("==============================");
    }
}
