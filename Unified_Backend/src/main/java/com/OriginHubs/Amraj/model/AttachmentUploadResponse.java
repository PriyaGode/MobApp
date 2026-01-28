package com.OriginHubs.Amraj.model;

public class AttachmentUploadResponse {

    private TicketAttachment attachment;
    private String message;
    private boolean success;

    // Constructors
    public AttachmentUploadResponse() {
    }

    public AttachmentUploadResponse(TicketAttachment attachment, String message, boolean success) {
        this.attachment = attachment;
        this.message = message;
        this.success = success;
    }

    // Getters and Setters
    public TicketAttachment getAttachment() {
        return attachment;
    }

    public void setAttachment(TicketAttachment attachment) {
        this.attachment = attachment;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    @Override
    public String toString() {
        return "AttachmentUploadResponse{" +
                "attachment=" + attachment +
                ", message='" + message + '\'' +
                ", success=" + success +
                '}';
    }
}
