package com.OriginHubs.Amraj.customer.dto;

import java.time.LocalDateTime;

public class CustomerComplaintResponse {
    
    private String ticketNumber;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;

    public CustomerComplaintResponse(String ticketNumber, String subject, String message, String status, LocalDateTime createdAt) {
        this.ticketNumber = ticketNumber;
        this.subject = subject;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}