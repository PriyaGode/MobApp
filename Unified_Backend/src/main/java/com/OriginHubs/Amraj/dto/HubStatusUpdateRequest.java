package com.OriginHubs.Amraj.dto;

import com.OriginHubs.Amraj.entity.enums.HubStatus;

public class HubStatusUpdateRequest {
    private HubStatus status;

    // Constructors
    public HubStatusUpdateRequest() {}

    public HubStatusUpdateRequest(HubStatus status) {
        this.status = status;
    }

    // Getters and Setters
    public HubStatus getStatus() { return status; }
    public void setStatus(HubStatus status) { this.status = status; }
}