package com.OriginHubs.Amraj.customer.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.model.UserOtp;
import com.OriginHubs.Amraj.model.enums.OtpStatus;
import com.OriginHubs.Amraj.model.enums.OtpType;
import com.OriginHubs.Amraj.repository.UserOtpRepository;

@Service
public class CustomerOtpService {
    @Autowired
    private ClickSendService clickSendService;

    @Autowired
    private UserOtpRepository otpRepository;

    @Autowired
    private CustomerEmailService emailService;

    // SmsService is injected but not currently used - reserved for future SMS OTP functionality
    @SuppressWarnings("unused")
    @Autowired
    private CustomerSmsService smsService;

    public UserOtp generateOtp(User user, OtpType type) {
        // Inactivate previous active OTPs
        otpRepository.findByUserAndTypeAndStatus(user, type, OtpStatus.ACTIVE).ifPresent(oldOtp -> {
            oldOtp.setStatus(OtpStatus.INACTIVE);
            otpRepository.save(oldOtp);
        });

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        UserOtp otp = new UserOtp();
        otp.setUser(user);
        otp.setOtp(otpCode);
        otp.setType(type);
        otp.setStatus(OtpStatus.ACTIVE);
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(otp);

        // Send OTP
        if (type == OtpType.EMAIL || type == OtpType.RESET_EMAIL) {
            emailService.sendEmail(user.getEmail(), "Your OTP Code", "OTP: " + otpCode + " (Expires in 10 min)");
        } else if (type == OtpType.PHONE) {

            // Ensure the phone number has +1 prefix
            String phoneWithCountryCode = user.getPhone();
            if (!phoneWithCountryCode.startsWith("+1")) {
                phoneWithCountryCode = "+1" + phoneWithCountryCode;
            }
            clickSendService.sendSms(user.getPhone(), "OTP: " + otpCode + " (Expires in 10 min)");
        }

        return otp;
    }

    public boolean verifyOtp(User user, String otpCode, OtpType type) {
        Optional<UserOtp> activeOtpOpt = otpRepository.findByUserAndTypeAndStatus(user, type, OtpStatus.ACTIVE);
        if (activeOtpOpt.isEmpty()) return false;

        UserOtp activeOtp = activeOtpOpt.get();

        if (activeOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            activeOtp.setStatus(OtpStatus.INACTIVE);
            otpRepository.save(activeOtp);
            return false;
        }

        if (activeOtp.getOtp().equals(otpCode)) {
            activeOtp.setStatus(OtpStatus.INACTIVE);
            otpRepository.save(activeOtp);
            return true;
        }

        return false;
    }
}
