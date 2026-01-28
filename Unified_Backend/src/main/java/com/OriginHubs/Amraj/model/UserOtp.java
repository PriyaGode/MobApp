package com.OriginHubs.Amraj.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.OriginHubs.Amraj.model.enums.OtpStatus;
import com.OriginHubs.Amraj.model.enums.OtpType;

@Entity
@Table(name = "user_otp")
public class UserOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 6, nullable = false)
    private String otp;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private OtpStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private OtpType type;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UserOtp() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public OtpStatus getStatus() { return status; }
    public void setStatus(OtpStatus status) { this.status = status; }

    public OtpType getType() { return type; }
    public void setType(OtpType type) { this.type = type; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
