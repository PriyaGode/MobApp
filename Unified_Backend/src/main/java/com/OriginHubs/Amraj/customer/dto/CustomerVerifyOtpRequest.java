package com.OriginHubs.Amraj.customer.dto;

public class CustomerVerifyOtpRequest {

    private String email; // optional for email OTP
    private String phone; // optional for phone OTP
    private String otp;

    // Default constructor
    public CustomerVerifyOtpRequest() {}

    // Parameterized constructor
    public CustomerVerifyOtpRequest(String email, String phone, String otp) {
        this.email = email;
        this.phone = phone;
        this.otp = otp;
    }

    // Getter and setter for email
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    // Getter and setter for phone
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // Getter and setter for otp
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
