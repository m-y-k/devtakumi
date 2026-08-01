package com.ooma.config;

import com.ooma.auth.AuthUserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final AppSettingRepository appSettingRepository;

    public SettingsController(AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    @GetMapping("/upi-id")
    public Map<String, String> getUpiId() {
        return appSettingRepository.findById("upi_id")
                .map(s -> Map.of("upiId", s.getValue()))
                .orElse(Map.of("upiId", "myk22.wallet@phonepe"));
    }

    @PutMapping("/upi-id")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> updateUpiId(@RequestBody Map<String, String> body) {
        AppSetting setting = appSettingRepository.findById("upi_id")
                .orElseGet(() -> {
                    AppSetting s = new AppSetting();
                    s.setKey("upi_id");
                    return s;
                });
        setting.setValue(body.get("upiId"));
        appSettingRepository.save(setting);
        return Map.of("message", "UPI ID updated");
    }
}
