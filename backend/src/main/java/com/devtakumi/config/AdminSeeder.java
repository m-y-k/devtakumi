package com.devtakumi.config;

import com.devtakumi.users.Role;
import com.devtakumi.users.User;
import com.devtakumi.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final AppSettingRepository appSettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;
    private final String upiId;

    public AdminSeeder(
            UserRepository userRepository,
            AppSettingRepository appSettingRepository,
            PasswordEncoder passwordEncoder,
            @Value("${devtakumi.admin.email}") String adminEmail,
            @Value("${devtakumi.admin.password}") String adminPassword,
            @Value("${devtakumi.admin.name}") String adminName,
            @Value("${devtakumi.upi-id}") String upiId) {
        this.userRepository = userRepository;
        this.appSettingRepository = appSettingRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.toLowerCase().trim();
        this.adminPassword = adminPassword;
        this.adminName = adminName;
        this.upiId = upiId;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedUpiSetting();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setRole(Role.ADMIN);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
        log.info("Seeded admin user: {}", adminEmail);
    }

    private void seedUpiSetting() {
        if (appSettingRepository.existsById("upi_id")) {
            return;
        }
        AppSetting setting = new AppSetting();
        setting.setKey("upi_id");
        setting.setValue(upiId);
        appSettingRepository.save(setting);
        log.info("Seeded UPI ID setting");
    }
}
