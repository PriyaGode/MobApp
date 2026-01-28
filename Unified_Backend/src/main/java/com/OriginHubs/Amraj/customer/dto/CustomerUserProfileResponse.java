package com.OriginHubs.Amraj.customer.dto;

public class CustomerUserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Boolean emailVerified;

    public CustomerUserProfileResponse() {}

    public CustomerUserProfileResponse(Long id, String fullName, String email, String phone, Boolean emailVerified) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.emailVerified = emailVerified;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
