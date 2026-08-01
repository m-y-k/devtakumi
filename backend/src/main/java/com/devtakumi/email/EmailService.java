package com.devtakumi.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String studentPortalUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${devtakumi.mail.from}") String fromAddress,
            @Value("${STUDENT_PORTAL_URL:http://localhost:5174}") String studentPortalUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.studentPortalUrl = studentPortalUrl;
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = studentPortalUrl + "/reset-password?token=" + token;
        sendOrLog(toEmail, "Reset your DevTakumi password",
                "Use this link to reset your password (expires in 1 hour):\n\n" + link);
    }

    public void sendSetPasswordEmail(String toEmail, String token) {
        String link = studentPortalUrl + "/set-password?token=" + token;
        sendOrLog(toEmail, "Welcome to DevTakumi — set your password",
                "Your enrollment has been approved. Set your password here (expires in 1 hour):\n\n"
                        + link + "\n\nThen sign in at: " + studentPortalUrl + "/login");
    }

    public void sendEnrollmentRejectedEmail(String toEmail, String note) {
        String body = "Your enrollment request was not approved.";
        if (note != null && !note.isBlank()) {
            body += "\n\nNote from admin: " + note;
        }
        sendOrLog(toEmail, "DevTakumi enrollment update", body);
    }

    public void sendCourseUnlockedEmail(String toEmail, String courseTitle) {
        sendOrLog(toEmail, "New course unlocked — " + courseTitle,
                "You can now access " + courseTitle + " in the student portal:\n\n" + studentPortalUrl);
    }

    private void sendOrLog(String to, String subject, String body) {
        if (fromAddress == null || fromAddress.isBlank() || fromAddress.contains("example.com")) {
            log.info("Email (dev mode) to={} subject={} body={}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}, logging instead: {}", to, body, ex);
        }
    }
}
