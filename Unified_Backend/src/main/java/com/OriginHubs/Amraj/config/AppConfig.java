package com.OriginHubs.Amraj.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.base-url}")
    private String baseUrl;

    public String getJwtSecret() { return jwtSecret; }
    public long getJwtExpiration() { return jwtExpiration; }
    public String getBaseUrl() { return baseUrl; }
}
