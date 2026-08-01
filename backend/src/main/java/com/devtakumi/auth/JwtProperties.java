package com.devtakumi.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "devtakumi.jwt")
public class JwtProperties {

    private String secret;
    private long accessExpirationMs = 900_000;
    private long refreshExpirationMs = 604_800_000;
    private long passwordTokenExpirationMs = 3_600_000;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    public void setAccessExpirationMs(long accessExpirationMs) {
        this.accessExpirationMs = accessExpirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public void setRefreshExpirationMs(long refreshExpirationMs) {
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public long getPasswordTokenExpirationMs() {
        return passwordTokenExpirationMs;
    }

    public void setPasswordTokenExpirationMs(long passwordTokenExpirationMs) {
        this.passwordTokenExpirationMs = passwordTokenExpirationMs;
    }
}
