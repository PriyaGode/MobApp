package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.model.SupportTicket.TicketPriority;

public class AssignTicketRequest {

    private String assignedTo;
    private String assignedToName; // Added for display purposes
    private TicketPriority priority;
    private String comment;
    private String performedBy;
    private String performedByRole;

    // Constructors
    public AssignTicketRequest() {
    }

    public AssignTicketRequest(String assignedTo, TicketPriority priority, String comment) {
        this.assignedTo = assignedTo;
        this.priority = priority;
        this.comment = comment;
    }

    // Getters and Setters
    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(String performedByRole) {
        this.performedByRole = performedByRole;
    }

    @Override
    public String toString() {
        return "AssignTicketRequest{" +
                "assignedTo='" + assignedTo + '\'' +
                ", assignedToName='" + assignedToName + '\'' +
                ", priority=" + priority +
                ", comment='" + comment + '\'' +
                ", performedBy='" + performedBy + '\'' +
                ", performedByRole='" + performedByRole + '\'' +
                '}';
    }
}
