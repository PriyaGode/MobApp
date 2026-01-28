package com.OriginHubs.Amraj.model;

import java.util.List;
import java.util.Map;

public class BulkUploadResponse {
    private int successCount;
    private int errorCount;
    private List<Map<String, Object>> errors;

    public BulkUploadResponse(int successCount, int errorCount, List<Map<String, Object>> errors) {
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = errors;
    }

    // Getters and Setters
    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }
    public List<Map<String, Object>> getErrors() { return errors; }
    public void setErrors(List<Map<String, Object>> errors) { this.errors = errors; }

}
