package com.OriginHubs.Amraj.config;

import java.io.File;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class FileStorageConfig {

    @PostConstruct
    public void init() {
        // Create invoices directory if it doesn't exist
        File invoicesDir = new File("invoices");
        if (!invoicesDir.exists()) {
            invoicesDir.mkdirs();
        }
    }
}