package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.TransferStatus;

public class TransferRequestDecisionRequest {
    private TransferStatus decision; // APPROVED or REJECTED
    private String approvedBy;
    private String notes;

    // Constructors
    public TransferRequestDecisionRequest() {}

    public TransferRequestDecisionRequest(TransferStatus decision, String approvedBy, String notes) {
        this.decision = decision;
        this.approvedBy = approvedBy;
        this.notes = notes;
    }

    // Getters and Setters
    public TransferStatus getDecision() { return decision; }
    public void setDecision(TransferStatus decision) { this.decision = decision; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}