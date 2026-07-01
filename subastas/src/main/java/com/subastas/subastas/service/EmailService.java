package com.subastas.subastas.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    private static final Pattern MONTO_PATTERN = Pattern.compile("\\b(\\d+\\.\\d{2})\\b");
    private static final DecimalFormat MONEY_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("es", "AR"));
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        MONEY_FORMAT = new DecimalFormat("#,##0.00", symbols);
    }

    public void enviarEmail(String destinatario, String asunto, String cuerpo) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(buildHtml(cuerpo), true);
            mailSender.send(mimeMessage);
            log.info("Email HTML enviado a {}: {}", destinatario, asunto);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar email: " + e.getMessage(), e);
        }
    }

    private String buildHtml(String cuerpo) {
        String cuerpoFormateado = formatearMontos(cuerpo);

        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

                      <!-- Header -->
                      <tr>
                        <td style="background:#1a237e;padding:28px 36px;text-align:center;">
                          <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;">
                            Subastas Online
                          </span>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="background:#ffffff;padding:36px 36px 28px;">
                          <p style="margin:0;font-size:16px;line-height:1.7;color:#212121;">
                            %s
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f5f5f5;padding:18px 36px;text-align:center;border-top:1px solid #e0e0e0;">
                          <p style="margin:0;font-size:12px;color:#9e9e9e;">
                            Este es un mensaje automatico, no respondas este correo.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(cuerpoFormateado);
    }

    private String formatearMontos(String texto) {
        Matcher matcher = MONTO_PATTERN.matcher(texto);
        StringBuffer resultado = new StringBuffer();
        while (matcher.find()) {
            double valor = Double.parseDouble(matcher.group(1));
            String formateado = "$" + MONEY_FORMAT.format(valor);
            matcher.appendReplacement(resultado, Matcher.quoteReplacement(formateado));
        }
        matcher.appendTail(resultado);
        return resultado.toString();
    }
}
