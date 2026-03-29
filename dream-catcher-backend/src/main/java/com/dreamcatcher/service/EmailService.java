package com.dreamcatcher.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmailChangeConfirmation(String toEmail, String token) {
        String link = baseUrl + "/api/v1/settings/confirm?token=" + token;
        sendHtml(toEmail,
                "Dream Catcher – potwierdź zmianę adresu e-mail",
                buildEmail(
                        "Zmiana adresu e-mail",
                        "Otrzymaliśmy prośbę o zmianę Twojego adresu e-mail.",
                        "Kliknij przycisk poniżej, aby potwierdzić zmianę.<br>Link jest ważny przez <strong>5 minut</strong>.",
                        link,
                        "Potwierdź zmianę e-mail"
                )
        );
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        sendHtml(toEmail,
                "Dream Catcher – reset hasła",
                buildEmail(
                        "Reset hasła",
                        "Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.",
                        "Kliknij przycisk poniżej, aby ustawić nowe hasło.<br>Link jest ważny przez <strong>15 minut</strong>.",
                        link,
                        "Ustaw nowe hasło"
                )
        );
    }

    public void sendPasswordChangeConfirmation(String toEmail, String token) {
        String link = baseUrl + "/api/v1/settings/confirm?token=" + token;
        sendHtml(toEmail,
                "Dream Catcher – potwierdź zmianę hasła",
                buildEmail(
                        "Zmiana hasła",
                        "Otrzymaliśmy prośbę o zmianę hasła do Twojego konta.",
                        "Kliknij przycisk poniżej, aby potwierdzić zmianę.<br>Link jest ważny przez <strong>5 minut</strong>.",
                        link,
                        "Potwierdź zmianę hasła"
                )
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(Objects.requireNonNull(fromAddress));
            helper.setTo(Objects.requireNonNull(to));
            helper.setSubject(Objects.requireNonNull(subject));
            helper.setText(Objects.requireNonNull(html), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    private String buildEmail(String title, String intro, String body, String link, String buttonLabel) {
        return """
            <!DOCTYPE html>
            <html lang="pl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#050614;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#050614;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%%" style="max-width:520px;">

                      <!-- Header -->
                      <tr>
                        <td align="center" style="padding-bottom:32px;">
                          <div style="display:inline-block;background:linear-gradient(135deg,rgba(124,106,245,0.15),rgba(124,106,245,0.05));border:1px solid rgba(124,106,245,0.3);border-radius:24px;padding:16px 24px;">
                            <span style="font-size:32px;">🌙</span>
                            <span style="display:block;color:#f0eeff;font-size:20px;font-weight:900;letter-spacing:-0.5px;margin-top:8px;">Dream Catcher</span>
                            <span style="display:block;color:#6b6a8a;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-top:4px;">holistic journal</span>
                          </div>
                        </td>
                      </tr>

                      <!-- Card -->
                      <tr>
                        <td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px 36px;">

                          <!-- Title -->
                          <h1 style="margin:0 0 16px;color:#f0eeff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">%s</h1>

                          <!-- Intro -->
                          <p style="margin:0 0 12px;color:#9b9ab8;font-size:15px;line-height:1.6;">%s</p>

                          <!-- Body -->
                          <p style="margin:0 0 32px;color:#9b9ab8;font-size:14px;line-height:1.6;">%s</p>

                          <!-- Button -->
                          <table cellpadding="0" cellspacing="0" width="100%%">
                            <tr>
                              <td align="center">
                                <a href="%s"
                                   style="display:inline-block;background:linear-gradient(135deg,#7c6af5,#5b4bc4);color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:16px;box-shadow:0 8px 30px rgba(124,106,245,0.4);">
                                  %s
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Fallback link -->
                          <p style="margin:28px 0 0;color:#6b6a8a;font-size:12px;line-height:1.6;text-align:center;">
                            Jeśli przycisk nie działa, skopiuj poniższy link:<br>
                            <a href="%s" style="color:#7c6af5;word-break:break-all;">%s</a>
                          </p>

                          <!-- Divider -->
                          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:28px 0;">

                          <!-- Footer note -->
                          <p style="margin:0;color:#6b6a8a;font-size:12px;text-align:center;line-height:1.6;">
                            Jeśli to nie Ty wysłałeś/aś tę prośbę, zignoruj tę wiadomość.<br>
                            Twoje konto jest bezpieczne.
                          </p>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td align="center" style="padding-top:24px;">
                          <p style="margin:0;color:#3d3c5a;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">
                            DREAM CATCHER · Holistics v4
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, title, intro, body, link, buttonLabel, link, link);
    }
}
