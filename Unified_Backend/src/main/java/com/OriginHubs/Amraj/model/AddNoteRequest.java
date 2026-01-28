package com.OriginHubs.Amraj.model;

public class AddNoteRequest {

    private String note;
    private String performedBy;
    private String performedByRole;

    // Constructors
    public AddNoteRequest() {
    }

    public AddNoteRequest(String note, String performedBy, String performedByRole) {
        this.note = note;
        this.performedBy = performedBy;
        this.performedByRole = performedByRole;
    }

    // Getters and Setters
    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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
        return "AddNoteRequest{" +
                "note='" + note + '\'' +
                ", performedBy='" + performedBy + '\'' +
                ", performedByRole='" + performedByRole + '\'' +
                '}';
    }
}
