package com.dreamcatcher.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.base-url}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmailChangeConfirmation(String toEmail, String token) {
        String link = baseUrl + "/api/v1/settings/confirm?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(toEmail);
        msg.setSubject("Dream Catcher – potwierdź zmianę adresu e-mail");
        msg.setText(
            "Otrzymaliśmy prośbę o zmianę adresu e-mail.\n\n" +
            "Kliknij link poniżej, aby potwierdzić zmianę (ważny przez 5 minut):\n\n" +
            link + "\n\n" +
            "Jeśli to nie Ty, zignoruj tę wiadomość."
        );
        mailSender.send(msg);
    }

    public void sendPasswordChangeConfirmation(String toEmail, String token) {
        String link = baseUrl + "/api/v1/settings/confirm?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(toEmail);
        msg.setSubject("Dream Catcher – potwierdź zmianę hasła");
        msg.setText(
            "Otrzymaliśmy prośbę o zmianę hasła.\n\n" +
            "Kliknij link poniżej, aby potwierdzić zmianę (ważny przez 5 minut):\n\n" +
            link + "\n\n" +
            "Jeśli to nie Ty, zignoruj tę wiadomość."
        );
        mailSender.send(msg);
    }
}
