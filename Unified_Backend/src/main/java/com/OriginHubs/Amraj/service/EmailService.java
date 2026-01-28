package com.OriginHubs.Amraj.service;

import java.io.File;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.model.Invoice;
import com.OriginHubs.Amraj.repository.InvoiceRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private InvoiceRepository invoiceRepository;

    public void sendInvoiceEmail(Invoice invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("hemapriya.gode@gmail.com");
            helper.setTo(invoice.getOrder().getCustomer().getEmail());
            helper.setSubject("Invoice " + invoice.getInvoiceNumber() + " - Order #" + invoice.getOrder().getId() + " Confirmed");
            
            String emailBody = buildEmailBody(invoice);
            helper.setText(emailBody, true);

            // Attach PDF if available
            if (invoice.getPdfPath() != null) {
                FileSystemResource file = new FileSystemResource(new File(invoice.getPdfPath()));
                helper.addAttachment(invoice.getInvoiceNumber() + ".pdf", file);
            }

            mailSender.send(message);
            
            // Update invoice as sent
            invoice.setEmailSent(true);
            invoiceRepository.save(invoice);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send invoice email: " + e.getMessage(), e);
        }
    }

    private String buildEmailBody(Invoice invoice) {
        StringBuilder itemsHtml = new StringBuilder();
        if (invoice.getOrder().getOrderItems() != null) {
            for (com.OriginHubs.Amraj.model.OrderItem item : invoice.getOrder().getOrderItems()) {
                java.math.BigDecimal itemTotal = item.getPrice().multiply(new java.math.BigDecimal(item.getQuantity()));
                itemsHtml.append(String.format(
                    "<tr><td>%s</td><td>%d</td><td>Rs. %s</td><td>Rs. %s</td></tr>",
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getPrice(),
                    itemTotal
                ));
            }
        }
        
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; margin: 20px;">
                <h2 style="color: #2e7d32;">Invoice - Thank you for your order!</h2>
                <p>Dear %s,</p>
                <p>Thank you for your order with Amraj Fresh Produce. Here are your invoice details:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Invoice Details</h3>
                    <p><strong>Invoice Number:</strong> %s</p>
                    <p><strong>Order ID:</strong> %s</p>
                    <p><strong>Date:</strong> %s</p>
                </div>
                
                <h3>Items Ordered:</h3>
                <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background-color: #e8f5e8;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th>
                    </tr>
                    %s
                </table>
                
                <div style="text-align: right; margin: 20px 0;">
                    <p><strong>Tax (18%%):</strong> Rs. %s</p>
                    <p style="font-size: 18px; color: #2e7d32;"><strong>Total Amount: Rs. %s</strong></p>
                </div>
                
                <p><strong>Delivery Address:</strong></p>
                <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #2e7d32;">%s</p>
                
                <p>Your fresh produce will be delivered soon. You can track your order status in our app.</p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                <strong>Amraj Fresh Produce Team</strong></p>
            </body>
            </html>
            """,
            invoice.getOrder().getCustomer().getFullName(),
            invoice.getInvoiceNumber(),
            invoice.getOrder().getId(),
            invoice.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            itemsHtml.toString(),
            invoice.getTaxAmount(),
            invoice.getTotalAmount(),
            invoice.getOrder().getDeliveryAddress() != null ? invoice.getOrder().getDeliveryAddress() : "Address not provided"
        );
    }
}