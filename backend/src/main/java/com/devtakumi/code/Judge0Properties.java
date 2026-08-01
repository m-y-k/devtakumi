package com.devtakumi.code;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "devtakumi.judge0")
public class Judge0Properties {
    private String url = "http://localhost:2358";

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
