package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.model.SupportTicket;

public class AssignTicketResponse {

    private SupportTicket ticket;
    private String message;
    private boolean notificationSent;

    // Constructors
    public AssignTicketResponse() {
    }

    public AssignTicketResponse(SupportTicket ticket, String message, boolean notificationSent) {
        this.ticket = ticket;
        this.message = message;
        this.notificationSent = notificationSent;
    }

    // Getters and Setters
    public SupportTicket getTicket() {
        return ticket;
    }

    public void setTicket(SupportTicket ticket) {
        this.ticket = ticket;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isNotificationSent() {
        return notificationSent;
    }

    public void setNotificationSent(boolean notificationSent) {
        this.notificationSent = notificationSent;
    }

    @Override
    public String toString() {
        return "AssignTicketResponse{" +
                "ticket=" + ticket +
                ", message='" + message + '\'' +
                ", notificationSent=" + notificationSent +
                '}';
    }
}
