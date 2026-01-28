package com.OriginHubs.Amraj.service;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.model.Invoice;
import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.model.OrderItem;
import com.OriginHubs.Amraj.repository.InvoiceRepository;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    public Invoice generateInvoice(Order order) {
        try {
            // Check if invoice already exists
            return invoiceRepository.findByOrderId(order.getId())
                    .orElseGet(() -> {
                        // Create invoice entity
                        Invoice invoice = new Invoice();
                        invoice.setOrder(order);
                        invoice.setInvoiceNumber(generateInvoiceNumber(order.getId()));
                        invoice.setTotalAmount(order.getTotalAmount());
                        invoice.setTaxAmount(calculateTax(order.getTotalAmount()));
                        invoice.setCreatedAt(LocalDateTime.now());

                        // Generate PDF
                        try {
                            String pdfPath = generateInvoicePDF(invoice);
                            invoice.setPdfPath(pdfPath);
                        } catch (IOException e) {
                            System.err.println("Failed to generate PDF: " + e.getMessage());
                            invoice.setPdfPath(null);
                        }

                        return invoiceRepository.save(invoice);
                    });
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage(), e);
        }
    }

    public Invoice getInvoiceByOrderId(Long orderId) {
        return invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for order: " + orderId));
    }

    public void updateEmailSentStatus(Invoice invoice) {
        invoiceRepository.save(invoice);
    }

    private String generateInvoiceNumber(Long orderId) {
        return "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + orderId;
    }

    private BigDecimal calculateTax(BigDecimal amount) {
        // 18% GST
        return amount.multiply(new BigDecimal("0.18"));
    }

    private String generateInvoicePDF(Invoice invoice) throws IOException {
        String fileName = invoice.getInvoiceNumber() + ".pdf";
        String filePath = "invoices/" + fileName;
        
        File directory = new File("invoices");
        if (!directory.exists()) {
            directory.mkdirs();
        }

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("INVOICE");
                contentStream.endText();
                
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 720);
                contentStream.showText("Amraj Fresh Produce");
                contentStream.endText();
                
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Invoice Number: " + invoice.getInvoiceNumber());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Order ID: " + invoice.getOrder().getId());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Date: " + invoice.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                contentStream.newLineAtOffset(0, -40);
                
                if (invoice.getOrder().getCustomer() != null) {
                    contentStream.showText("Customer: " + invoice.getOrder().getCustomer().getFullName());
                    contentStream.newLineAtOffset(0, -20);
                    contentStream.showText("Email: " + invoice.getOrder().getCustomer().getEmail());
                    contentStream.newLineAtOffset(0, -40);
                }
                
                contentStream.showText("Items:");
                contentStream.newLineAtOffset(0, -20);
                
                if (invoice.getOrder().getOrderItems() != null) {
                    for (OrderItem item : invoice.getOrder().getOrderItems()) {
                        BigDecimal itemTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
                        contentStream.showText(item.getProduct().getName() + " x" + item.getQuantity() + " = Rs. " + itemTotal);
                        contentStream.newLineAtOffset(0, -20);
                    }
                }
                
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Tax (18%): Rs. " + invoice.getTaxAmount());
                contentStream.newLineAtOffset(0, -20);
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.showText("Total: Rs. " + invoice.getTotalAmount());
                contentStream.endText();
            }
            
            document.save(filePath);
        }
        
        return filePath;
    }
}